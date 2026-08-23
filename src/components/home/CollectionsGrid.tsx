'use client';

import { motion } from 'framer-motion';
import { Folder, MoreVertical, ChevronRight } from 'lucide-react';

export interface Collection {
  id: string;
  name: string;
  itemCount: number;
  color: string;
}

interface CollectionsGridProps {
  collections: Collection[];
  onViewAll: () => void;
}

export function CollectionsGrid({ collections, onViewAll }: CollectionsGridProps) {
  if (collections.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-foreground">Collections</h2>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center"
        >
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-5 rounded-2xl bg-surface border border-border hover:border-border-hover cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-opacity-20 backdrop-blur-md"
                style={{ backgroundColor: `${collection.color}33`, border: `1px solid ${collection.color}55` }}
              >
                <Folder className="w-6 h-6" style={{ color: collection.color }} />
              </div>
              <button className="text-muted hover:text-foreground transition-colors p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-foreground font-bold text-lg mb-1">{collection.name}</h3>
              <p className="text-sm text-muted">{collection.itemCount} Items</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
