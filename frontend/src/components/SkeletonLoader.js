/**
 * Skeleton Loader Component
 * Placeholder loading UI
 */

import React from 'react';
import '../styles/SkeletonLoader.css';

const SkeletonLoader = ({ 
  type = 'card',
  count = 3,
  height = 200 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return Array(count).fill(0).map((_, i) => (
          <div key={i} className="skeleton skeleton-card">
            <div className="skeleton-header"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
            </div>
            <div className="skeleton-footer"></div>
          </div>
        ));

      case 'list':
        return Array(count).fill(0).map((_, i) => (
          <div key={i} className="skeleton skeleton-list">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-info">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ));

      case 'table':
        return (
          <div className="skeleton skeleton-table">
            {Array(count).fill(0).map((_, row) => (
              <div key={row} className="skeleton-row">
                {Array(4).fill(0).map((_, col) => (
                  <div key={col} className="skeleton-cell"></div>
                ))}
              </div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className="skeleton skeleton-form">
            <div className="skeleton-field">
              <div className="skeleton-label"></div>
              <div className="skeleton-input"></div>
            </div>
            <div className="skeleton-field">
              <div className="skeleton-label"></div>
              <div className="skeleton-input"></div>
            </div>
            <div className="skeleton-button"></div>
          </div>
        );

      default:
        return <div className="skeleton skeleton-card" style={{ height }}></div>;
    }
  };

  return <div className="skeleton-container">{renderSkeleton()}</div>;
};

export default SkeletonLoader;
