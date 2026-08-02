
'use client';

import { useState, useMemo } from 'react';
import type { Product, ProductCategories } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Gamepad2, Camera, BatteryFull, Hand, Diamond } from 'lucide-react';

interface ProductGridProps {
  allProducts: Product[];
}

const RATING_LEVELS: (ProductCategories[keyof ProductCategories])[] = ['GOAT', 'Great', 'Good', 'OK', 'For This Field?'];

const CATEGORY_FILTERS: { id: keyof ProductCategories; label: string, icon: React.ElementType }[] = [
    { id: 'gamingPerformance', label: 'Gaming', icon: Gamepad2 },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'battery', label: 'Battery', icon: BatteryFull },
    { id: 'looksAndFeel', label: 'Looks & Feel', icon: Hand },
    { id: 'valueForMoney', label: 'Value', icon: Diamond }
];

export function ProductGrid({ allProducts }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  
  const initialCategoryFilters = CATEGORY_FILTERS.reduce((acc, cat) => {
    acc[cat.id] = 'All';
    return acc;
  }, {} as Record<keyof ProductCategories, string>);

  const [categoryFilters, setCategoryFilters] = useState<Record<string, string>>(initialCategoryFilters);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 150000;
    return Math.ceil(Math.max(...allProducts.map(p => p.price)) / 1000) * 1000;
  }, [allProducts]);
  
  const [price, setPrice] = useState(maxPrice);
  const [sortBy, setSortBy] = useState('relevance');

  const brands = useMemo(() => ['All', ...Array.from(new Set(allProducts.map(p => p.brand)))], [allProducts]);
  const conditions = useMemo(() => ['All', 'Excellent', 'Very Good', 'Good', 'Fair'], []);
  
  const handleCategoryFilterChange = (categoryId: string, value: string) => {
    setCategoryFilters(prev => ({ ...prev, [categoryId]: value }));
  };

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (searchTerm) {
      products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedBrand !== 'All') {
      products = products.filter(p => p.brand === selectedBrand);
    }
    
    if (selectedCondition !== 'All') {
      products = products.filter(p => p.condition === selectedCondition);
    }
    
    for (const catId in categoryFilters) {
        if (categoryFilters[catId] !== 'All') {
            products = products.filter(p => p.categories && p.categories[catId as keyof ProductCategories] === categoryFilters[catId]);
        }
    }

    products = products.filter(p => p.price <= price);

    // Sorting logic
    if (sortBy === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    }

    return products;
  }, [allProducts, searchTerm, selectedBrand, selectedCondition, price, sortBy, categoryFilters]);
  
  return (
    <div className="space-y-8">
      <div className="bg-background p-4 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
              <label htmlFor="search" className="text-sm font-medium sr-only">Search</label>
              <Input 
                id="search"
                placeholder="Search phones..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="space-y-1">
              <label htmlFor="brand" className="text-sm font-medium sr-only">Brand</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Brands</SelectItem>
                  {brands.filter(b => b !== 'All').map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
          <div className="space-y-1">
              <label htmlFor="condition" className="text-sm font-medium sr-only">Condition</label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => <SelectItem key={condition} value={condition}>{condition === 'All' ? 'All Conditions' : condition}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
          <div className="space-y-1 pt-4">
            <label className="text-sm text-muted-foreground">Price: NPR 0 - NPR {price.toLocaleString()}</label>
            <Slider
              min={0}
              max={maxPrice}
              step={10000}
              value={[price]}
              onValueChange={value => setPrice(value[0])}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
          {CATEGORY_FILTERS.map(cat => (
              <div key={cat.id} className="space-y-1">
                  <label htmlFor={`cat-${cat.id}`} className="text-xs text-muted-foreground flex items-center gap-1.5"><cat.icon className="h-3.5 w-3.5" />{cat.label}</label>
                  <Select value={categoryFilters[cat.id]} onValueChange={(value) => handleCategoryFilterChange(cat.id, value)}>
                    <SelectTrigger id={`cat-${cat.id}`} className="text-xs h-9">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Any Rating</SelectItem>
                      {RATING_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{filteredProducts.length} phones found</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-auto gap-2">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Sort by: Relevance</SelectItem>
            <SelectItem value="price-asc">Sort by: Price (low to high)</SelectItem>
            <SelectItem value="price-desc">Sort by: Price (high to low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))
        ) : (
          <div className="text-center col-span-full py-16 text-muted-foreground">
            <p className="text-lg font-semibold">No phones found</p>
            <p>Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
