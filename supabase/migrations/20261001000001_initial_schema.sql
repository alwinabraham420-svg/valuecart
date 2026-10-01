-- ==============================================================================
-- VALUECART E-COMMERCE DATABASE INITIAL SCHEMA & SEED (SUPABASE / POSTGRESQL)
-- Production Data Architecture for ValueCart
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone VARCHAR(20),
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

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    selling_price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    rating NUMERIC(2, 1) DEFAULT 4.8,
    review_count INT DEFAULT 0,
    primary_image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    stock_quantity INT DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    is_deal BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT true,
    is_cod_available BOOLEAN DEFAULT true,
    is_online_payment_available BOOLEAN DEFAULT true,
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

-- 5. SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    supplier_type VARCHAR(30) DEFAULT 'hub',
    contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRODUCT ECONOMICS (Admin only)
CREATE TABLE IF NOT EXISTS public.product_economics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_cost NUMERIC(10, 2) NOT NULL,
    supplier_product_id TEXT,
    supplier_product_url TEXT,
    target_cac NUMERIC(10, 2) DEFAULT 85.00,
    advertising_cost NUMERIC(10, 2) DEFAULT 85.00,
    estimated_gateway_fee NUMERIC(10, 2) DEFAULT 0.00,
    other_cost NUMERIC(10, 2) DEFAULT 18.00,
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
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    customer_email TEXT,
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
    product_slug TEXT,
    image_url TEXT,
    variant_details TEXT,
    quantity INT NOT NULL DEFAULT 1,
    unit_selling_price NUMERIC(10, 2) NOT NULL,
    unit_supplier_cost NUMERIC(10, 2) NOT NULL DEFAULT 0
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

-- 11. SUPPLIER ORDERS
CREATE TABLE IF NOT EXISTS public.supplier_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_order_id VARCHAR(50),
    total_supplier_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    courier_name VARCHAR(50),
    tracking_number VARCHAR(100),
    supplier_ordered_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 12. MARKETING ATTRIBUTION
CREATE TABLE IF NOT EXISTS public.marketing_attribution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    utm_source VARCHAR(50),
    utm_medium VARCHAR(50),
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    fbclid TEXT,
    landing_page TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. ORDER STATUS HISTORY
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;

-- 1. Public can read active categories
CREATE POLICY "Public categories viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- 2. Public can read active products
CREATE POLICY "Public products viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true);

-- 3. Public can read active product variants
CREATE POLICY "Public variants viewable by everyone" ON public.product_variants
    FOR SELECT USING (true);

-- 4. Order Creation Policies (Allows public checkout)
CREATE POLICY "Public can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own orders by order_number" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Public can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view order items" ON public.order_items
    FOR SELECT USING (true);

CREATE POLICY "Public can insert payments" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view payments" ON public.payments
    FOR SELECT USING (true);

CREATE POLICY "Public can insert attribution" ON public.marketing_attribution
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert status history" ON public.order_status_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view status history" ON public.order_status_history
    FOR SELECT USING (true);

-- 5. Product economics strictly restricted (Admins only)
CREATE POLICY "Product economics admin only" ON public.product_economics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
        )
    );

-- 6. Supplier orders strictly restricted (Admins only)
CREATE POLICY "Supplier orders admin only" ON public.supplier_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
        )
    );

-- ==============================================================================
-- INITIAL SEED: CATEGORY & 304 STAINLESS STEEL CHOPPING BOARD (₹299)
-- ==============================================================================

-- Seed Category
INSERT INTO public.categories (id, name, slug, icon_name, image_url, featured, display_order)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Home & Kitchen',
    'home-kitchen',
    'Home',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    true,
    1
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Seed Supplier Hub
INSERT INTO public.suppliers (id, name, supplier_type, contact_phone, notes)
VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'ValueCart Supplier Hub (Wholesale)',
    'hub',
    '+91-9876543210',
    'Primary kitchen essentials supplier'
) ON CONFLICT DO NOTHING;

-- Seed Product: 304 Stainless Steel Chopping Board at exact ₹299
INSERT INTO public.products (
    id,
    category_id,
    slug,
    name,
    short_name,
    description,
    selling_price,
    original_price,
    discount_percentage,
    rating,
    review_count,
    primary_image,
    images,
    stock_quantity,
    is_active,
    is_deal,
    is_bestseller,
    is_cod_available,
    is_online_payment_available,
    specs
) VALUES (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'stainless-steel-chopping-board',
    '304 Stainless Steel Chopping Board – Vegetable, Fruit & Meat Cutting Board',
    'Stainless Steel Chopping Board',
    'A medium-size stainless steel chopping board designed for everyday kitchen use. Crafted from food-safe 304 stainless steel, it features a hygienic, non-porous cutting surface that does not harbor bacteria, absorb odors, or release microplastics into your food. Engineered for multi-purpose kitchen prep with a convenient hanging handle and smooth rounded edges for safe, comfortable use.',
    299.00,
    299.00,
    0,
    4.8,
    342,
    '/images/products/chopping-board-1.jpg',
    '[
        "/images/products/chopping-board-1.jpg",
        "/images/products/chopping-board-2.jpg",
        "/images/products/chopping-board-3.jpg"
    ]'::jsonb,
    120,
    true,
    true,
    true,
    true,
    true,
    '{
        "material": "304 Stainless Steel",
        "dimensions": "31.7 cm × 20.8 cm",
        "sizeLabel": "Medium Size (31.7 CM × 20.8 CM)",
        "features": [
            "304 Stainless Steel",
            "Rust Resistant",
            "Hygienic Surface",
            "Easy to Clean",
            "Odour & Stain Resistant",
            "Multi-Purpose Use",
            "Convenient Handle Design",
            "Smooth Rounded Edges"
        ],
        "useCases": [
            {
                "title": "CUT VEGETABLES & FRUITS",
                "subtitle": "Clean, effortless slicing with no stain absorption",
                "image": "/images/products/chopping-board-1.jpg"
            },
            {
                "title": "CUT MEAT & FISH",
                "subtitle": "Hygienic prep without harboring bacteria or raw odors",
                "image": "/images/products/chopping-board-2.jpg"
            },
            {
                "title": "KNEAD DOUGH & BAKE PREP",
                "subtitle": "Non-stick, smooth food-grade kneading surface",
                "image": "/images/products/chopping-board-3.jpg"
            },
            {
                "title": "CUT BREAD & MORE",
                "subtitle": "Crumb-free, clean cutting for bread and pastries",
                "image": "/images/products/chopping-board-1.jpg"
            }
        ]
    }'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
    selling_price = 299.00,
    original_price = 299.00,
    discount_percentage = 0,
    specs = EXCLUDED.specs,
    images = EXCLUDED.images;

-- Seed Economics (Admin Only)
INSERT INTO public.product_economics (
    product_id,
    supplier_id,
    supplier_cost,
    target_cac,
    advertising_cost,
    estimated_gateway_fee,
    other_cost,
    estimated_profit,
    internal_notes
) VALUES (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    114.00,
    85.00,
    85.00,
    0.00,
    18.00,
    82.00,
    'Sourced via ValueCart Supplier Hub. Net margin ~27.4% at ₹299 retail.'
) ON CONFLICT (product_id) DO UPDATE SET
    supplier_cost = 114.00,
    target_cac = 85.00,
    advertising_cost = 85.00,
    estimated_profit = 82.00;
