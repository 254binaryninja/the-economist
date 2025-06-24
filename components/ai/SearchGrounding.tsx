'use client';

import { ExternalLink, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GroundingInfo } from '@/types';

interface SearchGroundingProps {
  grounding: GroundingInfo;
}

export default function SearchGrounding({ grounding }: SearchGroundingProps) {
  if (!grounding || (!grounding.groundingChunks?.length && !grounding.searchQueries?.length)) {
    return null;
  }

  return (
    <Card className="mt-3 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <Search className="h-4 w-4" />
          Search Citations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search Queries */}
        {grounding.searchQueries?.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Search Queries Used:
            </h4>
            <div className="flex flex-wrap gap-1">
              {grounding.searchQueries.map((query, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Source Links */}
        {grounding.groundingChunks?.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Sources:
            </h4>
            <div className="space-y-2">
              {grounding.groundingChunks.map((chunk, index) => (
                <a
                  key={index}
                  href={chunk.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2 rounded-md border border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/50 transition-colors group"
                >
                  <ExternalLink className="h-3 w-3 mt-1 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate group-hover:text-blue-800 dark:group-hover:text-blue-50">
                      {chunk.web.title}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {new URL(chunk.web.uri).hostname}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}