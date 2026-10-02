'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Product } from '@/types';
import { CATEGORIES } from '@/data/categories';

export default function AdminProductsPage() {
  const { products, updateProduct, addProduct, deleteProduct } = useAdmin();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for edit/add modal
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Men Fashion');
  const [categorySlug, setCategorySlug] = useState('men-fashion');
  const [price, setPrice] = useState(499);
  const [originalPrice, setOriginalPrice] = useState(999);
  const [supplierCost, setSupplierCost] = useState(190);
  const [targetCac, setTargetCac] = useState(150);
  const [advertisingCost, setAdvertisingCost] = useState(140);
  const [supplierName, setSupplierName] = useState('Meesho Supplier');
  const [supplierUrl, setSupplierUrl] = useState('');
  const [supplierProductId, setSupplierProductId] = useState('');
  const [isCodAvailable, setIsCodAvailable] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [stock, setStock] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [image, setImage] = useState('');

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategory(p.category);
    setCategorySlug(p.categorySlug);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setStock(typeof p.stock === 'number' ? p.stock : 0);
    setIsAvailable(Boolean(p.isAvailable !== false && (p.stock ?? 0) > 0));
    setSupplierCost(p.economics?.supplierCost || Math.round(p.price * 0.45));
    setTargetCac(p.economics?.targetCac || 150);
    setAdvertisingCost(p.economics?.advertisingCost || 140);
    setSupplierName(p.economics?.supplierName || 'Meesho Supplier');
    setSupplierUrl(p.economics?.supplierUrl || '');
    setSupplierProductId(p.economics?.supplierProductId || '');
    setIsCodAvailable(p.economics?.isCodAvailable ?? true);
    setIsActive(p.economics?.isActive ?? true);
    setImage(p.image);
    setIsAddModalOpen(true);
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategory('Home & Kitchen');
    setCategorySlug('home-kitchen');
    setPrice(599);
    setOriginalPrice(1199);
    setStock(50);
    setIsAvailable(true);
    setSupplierCost(210);
    setTargetCac(160);
    setAdvertisingCost(150);
    setSupplierName('Meesho Seller');
    setSupplierUrl('https://supplier.meesho.com');
    setSupplierProductId('');
    setIsCodAvailable(true);
    setIsActive(true);
    setImage('https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedDiscount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const gatewayFee = Math.round(price * 0.02);
    const otherCost = 25;
    const estimatedProfit = price - supplierCost - advertisingCost - gatewayFee - otherCost;

    const economicsData = {
      supplierName,
      supplierUrl,
      supplierProductId,
      supplierCost: Number(supplierCost),
      targetCac: Number(targetCac),
      advertisingCost: Number(advertisingCost),
      estimatedGatewayFee: gatewayFee,
      otherCost,
      maxAcceptableCac: Math.max(0, price - supplierCost - gatewayFee - otherCost),
      estimatedProfit,
      isCodAvailable,
      isActive,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount: calculatedDiscount,
        category,
        categorySlug,
        image,
        stock: Number(stock),
        isAvailable: Boolean(isAvailable && Number(stock) > 0),
        economics: economicsData,
      });
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount: calculatedDiscount,
        category,
        categorySlug,
        rating: 4.5,
        reviewCount: 1,
        image,
        images: [image],
        description: `${name} sourced for everyday value and comfort.`,
        stock: Number(stock),
        isAvailable: Boolean(isAvailable && Number(stock) > 0),
        economics: economicsData,
      };
      addProduct(newProd);
    }

    setIsAddModalOpen(false);
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy tracking-tight">
            Products &amp; Unit Economics
          </h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1">
            Configure retail prices, Meesho sourcing costs, Meta Ads target CAC and evaluate profitability.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewProductModal}
          className="bg-valuecart-green hover:bg-valuecart-green-dark text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-valuecart-border/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 focus:ring-valuecart-green"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
          <span className="text-xs text-valuecart-text-muted font-bold shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-valuecart-navy font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products & Unit Economics Table */}
      <div className="bg-white rounded-3xl border border-valuecart-border/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-valuecart-navy font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Store Status</th>
                <th className="p-4">Category</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Supplier Cost</th>
                <th className="p-4">Target CAC</th>
                <th className="p-4">Ad Spend</th>
                <th className="p-4">Max CAC</th>
                <th className="p-4 text-right">Est. Unit Profit</th>
                <th className="p-4 text-center">COD Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((prod) => {
                const ec = prod.economics;
                const selling = prod.price;
                const sup = ec?.supplierCost || Math.round(prod.price * 0.45);
                const ad = ec?.advertisingCost || 140;
                const maxCac = ec?.maxAcceptableCac || (selling - sup - 35);
                const profit = ec?.estimatedProfit || (selling - sup - ad - 35);

                return (
                  <tr key={prod.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 relative">
                          <img src={prod.image} alt={prod.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <Link
                            href={`/product/${prod.slug}`}
                            target="_blank"
                            className="font-bold text-valuecart-navy hover:text-valuecart-green hover:underline line-clamp-1 text-sm block"
                          >
                            {prod.name}
                          </Link>
                          {ec?.supplierName && (
                            <span className="text-[11px] text-valuecart-text-muted truncate block">
                              Src: {ec.supplierName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {prod.stock > 0 && prod.isAvailable !== false ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 stroke-[3]" />
                            IN STOCK ({prod.stock})
                          </span>
                          <button
                            type="button"
                            onClick={() => updateProduct(prod.id, { stock: 0, isAvailable: false })}
                            className="text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Mark Out of Stock"
                          >
                            Set Out of Stock
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            <X className="w-3 h-3 stroke-[3]" />
                            OUT OF STOCK
                          </span>
                          <button
                            type="button"
                            onClick={() => updateProduct(prod.id, { stock: 50, isAvailable: true })}
                            className="text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Restock with 50 units"
                          >
                            Restock (50)
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-semibold text-valuecart-navy whitespace-nowrap">
                      {prod.category}
                    </td>

                    <td className="p-4 font-black text-valuecart-navy whitespace-nowrap text-sm">
                      ₹{prod.price}
                    </td>

                    <td className="p-4 font-bold text-amber-800 whitespace-nowrap">
                      ₹{sup}
                    </td>

                    <td className="p-4 font-bold text-purple-700 whitespace-nowrap">
                      ₹{ec?.targetCac || 150}
                    </td>

                    <td className="p-4 font-bold text-purple-900 whitespace-nowrap">
                      ₹{ad}
                    </td>

                    <td className="p-4 font-bold text-gray-600 whitespace-nowrap">
                      ₹{maxCac}
                    </td>

                    <td className="p-4 text-right font-black text-sm whitespace-nowrap">
                      <span className={profit > 0 ? 'text-valuecart-green' : 'text-rose-600'}>
                        {profit > 0 ? `+₹${profit}` : `₹${profit}`}
                      </span>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          ec?.isCodAvailable ?? true ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {ec?.isCodAvailable ?? true ? 'COD ON' : 'COD OFF'}
                      </span>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-valuecart-navy hover:text-valuecart-green hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Economics"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete product ${prod.name}?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5 animate-fade-in border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-black text-valuecart-navy">
                {editingProduct ? `Edit Economics: ${editingProduct.name}` : 'Add New Product & Sourcing Details'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-valuecart-navy rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs focus:ring-1 focus:ring-valuecart-green focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      const found = CATEGORIES.find((c) => c.name === e.target.value);
                      if (found) setCategorySlug(found.slug);
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs focus:ring-1 focus:ring-valuecart-green focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Customer Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs font-bold focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Original / Crossed Price (₹)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Stock Availability Status *
                  </label>
                  <select
                    value={isAvailable ? 'in_stock' : 'out_of_stock'}
                    onChange={(e) => {
                      const inStock = e.target.value === 'in_stock';
                      setIsAvailable(inStock);
                      if (inStock && stock <= 0) setStock(50);
                      if (!inStock) setStock(0);
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs font-bold focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  >
                    <option value="in_stock">IN STOCK (Purchasable)</option>
                    <option value="out_of_stock">OUT OF STOCK (Browsing Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Stock Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStock(val);
                      if (val > 0) setIsAvailable(true);
                      else setIsAvailable(false);
                    }}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs font-bold focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  />
                </div>

                {/* Sourcing & Unit Economics (ADMIN ONLY) */}
                <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-valuecart-green bg-valuecart-green-tint px-2.5 py-0.5 rounded inline-block mb-3">
                    Admin-Only Unit Economics &amp; Sourcing
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1">
                    Supplier Sourcing Cost (₹) *
                  </label>
                  <input
                    type="number"
                    value={supplierCost}
                    onChange={(e) => setSupplierCost(Number(e.target.value))}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-amber-300 text-valuecart-navy text-xs font-bold focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">
                    Allocated Meta Ad Spend / CAC (₹) *
                  </label>
                  <input
                    type="number"
                    value={advertisingCost}
                    onChange={(e) => setAdvertisingCost(Number(e.target.value))}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-purple-300 text-valuecart-navy text-xs font-bold focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Supplier Name (e.g. Meesho Seller)
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs focus:ring-1 focus:ring-valuecart-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Supplier Sourcing URL
                  </label>
                  <input
                    type="url"
                    value={supplierUrl}
                    onChange={(e) => setSupplierUrl(e.target.value)}
                    placeholder="https://supplier.meesho.com/..."
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-valuecart-navy text-xs focus:ring-1 focus:ring-valuecart-green focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Profit Calculation Display */}
              <div className="p-4 bg-valuecart-green-surface rounded-2xl border border-valuecart-green/20 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-valuecart-navy">
                  <span>Calculated Net Unit Profit:</span>
                  <span className="text-base font-black text-valuecart-green">
                    ₹{price - supplierCost - advertisingCost - Math.round(price * 0.02) - 25}
                  </span>
                </div>
                <p className="text-[11px] text-valuecart-text-muted">
                  Formula: Selling (₹{price}) - Supplier (₹{supplierCost}) - Ad Spend (₹{advertisingCost}) - Gateway (₹{Math.round(price * 0.02)}) - Other (₹25)
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-valuecart-navy">
                  <input
                    type="checkbox"
                    checked={isCodAvailable}
                    onChange={(e) => setIsCodAvailable(e.target.checked)}
                    className="w-4 h-4 accent-valuecart-green"
                  />
                  <span>Enable Cash on Delivery (COD)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-valuecart-text-muted hover:text-valuecart-navy font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-valuecart-green hover:bg-valuecart-green-dark text-white font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Product Economics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
