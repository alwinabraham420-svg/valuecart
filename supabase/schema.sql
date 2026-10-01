-- ==============================================================================
-- VALUECART E-COMMERCE DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- Production Data Architecture supporting Indian Reselling & Meta Ads Workflow
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone VARCHAR(15),
    full_name TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS (Customer-Visible)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    selling_price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    rating NUMERIC(2, 1) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    primary_image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_deal BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    is_cod_available BOOLEAN DEFAULT true,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCT VARIANTS (Sizes, Colors)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_type VARCHAR(20) NOT NULL, -- 'size', 'color'
    variant_name TEXT NOT NULL,
    variant_value TEXT NOT NULL,
    sku VARCHAR(50),
    stock INT DEFAULT 0,
    price_adjustment NUMERIC(10, 2) DEFAULT 0
);

-- 5. SUPPLIERS (Meesho, Surat Wholesalers, etc.)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    supplier_type VARCHAR(30) DEFAULT 'meesho_seller',
    contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRODUCT ECONOMICS (STRICTLY ADMIN ONLY - NEVER EXPOSED TO CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.product_economics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_cost NUMERIC(10, 2) NOT NULL, -- Sourcing wholesale price
    supplier_product_id TEXT,
    supplier_product_url TEXT,
    target_cac NUMERIC(10, 2) DEFAULT 150.00, -- Target Meta Ad CAC
    advertising_cost NUMERIC(10, 2) DEFAULT 140.00,
    estimated_gateway_fee NUMERIC(10, 2) DEFAULT 12.00,
    other_cost NUMERIC(10, 2) DEFAULT 25.00,
    max_acceptable_cac NUMERIC(10, 2),
    estimated_profit NUMERIC(10, 2),
    internal_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    house_flat TEXT NOT NULL,
    street_area TEXT NOT NULL,
    landmark TEXT,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. BZ-1024
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_mobile VARCHAR(15) NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    order_status VARCHAR(30) DEFAULT 'new' CHECK (order_status IN (
        'new',
        'payment_confirmed',
        'ready_for_supplier',
        'supplier_ordered',
        'supplier_confirmed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded'
    )),
    total_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    shipping_charge NUMERIC(10, 2) DEFAULT 0,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_details TEXT,
    quantity INT NOT NULL DEFAULT 1,
    unit_selling_price NUMERIC(10, 2) NOT NULL,
    unit_supplier_cost NUMERIC(10, 2) NOT NULL -- Admin tracked
);

-- 10. PAYMENTS (Razorpay & COD)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cod', 'online')),
    payment_status VARCHAR(20) DEFAULT 'pending_cod' CHECK (payment_status IN ('pending_cod', 'paid', 'failed', 'refunded')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 11. SUPPLIER ORDERS (Fulfillment Tracking for Meesho)
CREATE TABLE IF NOT EXISTS public.supplier_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_order_id VARCHAR(50), -- Order ID generated on Meesho
    total_supplier_cost NUMERIC(10, 2) NOT NULL,
    courier_name VARCHAR(50),
    tracking_number VARCHAR(100), -- Courier AWB
    supplier_ordered_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 12. MARKETING ATTRIBUTION (Meta Ads Attribution Tracking)
CREATE TABLE IF NOT EXISTS public.marketing_attribution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    utm_source VARCHAR(50), -- facebook, instagram, google
    utm_medium VARCHAR(50), -- paid_social
    utm_campaign TEXT, -- kitchen_chopper_october
    utm_content TEXT, -- video_01
    utm_term TEXT,
    fbclid TEXT, -- Meta click identifier
    landing_page TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. ORDER STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    note TEXT,
    updated_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    max_discount_amount NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 15. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;

-- Customers can view active products
CREATE POLICY "Public products viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true);

-- Product economics only accessible by admins
CREATE POLICY "Product economics admin only" ON public.product_economics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
        )
    );

-- Supplier orders only accessible by admins
CREATE POLICY "Supplier orders admin only" ON public.supplier_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
        )
    );

-- Customers can view their own orders
CREATE POLICY "Customers view own orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid());
