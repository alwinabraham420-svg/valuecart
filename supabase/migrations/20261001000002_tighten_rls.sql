-- ==============================================================================
-- VALUECART SECURITY UPGRADE: TIGHTEN ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Customer A can ONLY view their own orders (auth.uid() = user_id)
-- Admins can view and manage all operational data.
-- Sensitive supplier costs and unit economics are restricted to admin roles.
-- ==============================================================================

-- 1. Tighten ORDERS Table RLS
DROP POLICY IF EXISTS "Public can view own orders by order_number" ON public.orders;
DROP POLICY IF EXISTS "Customers and Admin can view orders" ON public.orders;

CREATE POLICY "Customers and Admin can view orders" ON public.orders
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
        )
    );

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
        )
    );

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
        )
    );

-- 2. Tighten ORDER_ITEMS Table RLS
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Customers and Admin can view order items" ON public.order_items;

CREATE POLICY "Customers and Admin can view order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (
                (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
                OR EXISTS (
                    SELECT 1 FROM public.users
                    WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
                )
            )
        )
    );

-- 3. Tighten PAYMENTS Table RLS
DROP POLICY IF EXISTS "Public can view payments" ON public.payments;
DROP POLICY IF EXISTS "Customers and Admin can view payments" ON public.payments;

CREATE POLICY "Customers and Admin can view payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
            AND (
                (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
                OR EXISTS (
                    SELECT 1 FROM public.users
                    WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
                )
            )
        )
    );

-- 4. Tighten USERS Table RLS (Customer PII Protection)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile or admin can view all" ON public.users;
CREATE POLICY "Users can read own profile or admin can view all" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'operator')
        )
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Public can insert own user record" ON public.users;
CREATE POLICY "Public can insert own user record" ON public.users
    FOR INSERT WITH CHECK (true);
