import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { isPrivateTour } from '../../utils/tourHelpers';

const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

const TourFilterDropdown = ({
  tours = [],
  selectedTours = [],
  onChange,
  placeholder = '-- Tất cả Tour --',
  className = 'filter-select',
  style = {},
  excludePrivate = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Autofocus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter tours based on search term
  const filteredTours = useMemo(() => {
    let list = tours || [];
    if (excludePrivate) {
      list = list.filter(tour => !isPrivateTour(tour) || (selectedTours || []).some(id => String(id) === String(tour?.id)));
    }
    if (!searchTerm.trim()) return list;
    const term = removeAccents(searchTerm);
    return list.filter(tour => {
      const name = removeAccents(tour.name || '');
      const code = removeAccents(tour.code || '');
      return name.includes(term) || code.includes(term);
    });
  }, [tours, searchTerm, excludePrivate, selectedTours]);

  // Check if NO_TOUR matches search
  const showNoTourOption = useMemo(() => {
    if (!searchTerm.trim()) return true;
    const term = removeAccents(searchTerm);
    return removeAccents('[chưa chọn tour] chua chon tour khong co tour no tour').includes(term);
  }, [searchTerm]);

  const toggleTour = (tourId) => {
    const idStr = String(tourId);
    const isSelected = selectedTours.includes(idStr);
    let updated;
    if (isSelected) {
      updated = selectedTours.filter(id => id !== idStr);
    } else {
      updated = [...selectedTours, idStr];
    }
    onChange?.(updated);
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredTours.map(t => String(t.id));
    if (showNoTourOption && !filteredIds.includes('NO_TOUR')) {
      filteredIds.push('NO_TOUR');
    }
    const combined = Array.from(new Set([...selectedTours, ...filteredIds]));
    onChange?.(combined);
  };

  const handleClearAll = () => {
    onChange?.([]);
  };

  // Label display
  const renderDisplayLabel = () => {
    if (!selectedTours || selectedTours.length === 0) {
      return <span style={{ color: '#64748b' }}>{placeholder}</span>;
    }
    if (selectedTours.length === 1) {
      const singleId = selectedTours[0];
      if (singleId === 'NO_TOUR') {
        return <span style={{ color: '#ef4444', fontWeight: 600 }}>[Chưa chọn Tour]</span>;
      }
      const matched = tours.find(t => String(t.id) === singleId);
      return (
        <span style={{ color: '#1e293b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {matched ? matched.name : `Tour #${singleId}`}
        </span>
      );
    }
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#1e293b', fontWeight: 600 }}>Đã chọn:</span>
        <span style={{ 
          backgroundColor: '#eff6ff', 
          color: '#2563eb', 
          padding: '1px 7px', 
          borderRadius: 12, 
          fontSize: '0.75rem', 
          fontWeight: 700,
          border: '1px solid #bfdbfe'
        }}>
          {selectedTours.length} tour
        </span>
      </span>
    );
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Trigger Button */}
      <div
        className={className}
        style={{
          cursor: 'pointer',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          userSelect: 'none',
          border: isOpen ? '1px solid #3b82f6' : '1px solid #cbd5e1',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.15)' : 'none',
          transition: 'all 0.15s'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title={selectedTours.length > 0 ? `Đã chọn ${selectedTours.length} tour` : placeholder}
      >
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {renderDisplayLabel()}
        </div>
        <ChevronDown
          size={15}
          style={{
            color: '#94a3b8',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}
        />
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '320px',
            maxWidth: '440px',
            width: 'max(100%, 320px)',
            background: 'white',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            zIndex: 1000,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Sticky Search Header */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm tên tour, tuyến điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '7px 28px 7px 32px',
                  fontSize: '0.82rem',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  style={{
                    position: 'absolute',
                    right: 6,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sub-header: Count + Action Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '0.75rem', color: '#64748b' }}>
              <span>
                {searchTerm ? `Tìm thấy ${filteredTours.length} tour` : `Tổng cộng: ${tours?.length || 0} tour`}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                {searchTerm && filteredTours.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAllFiltered();
                    }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Chọn tất cả ({filteredTours.length})
                  </button>
                )}
                {selectedTours?.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Xóa chọn ({selectedTours.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tour Items List */}
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {/* [Chưa chọn Tour] option */}
            {showNoTourOption && (
              <div
                style={{
                  padding: '9px 12px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  background: selectedTours.includes('NO_TOUR') ? '#fef2f2' : 'transparent',
                  transition: 'background 0.15s'
                }}
                className="hover:bg-red-50"
                onClick={() => toggleTour('NO_TOUR')}
              >
                <input
                  type="checkbox"
                  checked={selectedTours.includes('NO_TOUR')}
                  readOnly
                  style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#ef4444' }}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ef4444' }}>
                  [Chưa chọn Tour]
                </span>
              </div>
            )}

            {/* Tours list */}
            {filteredTours.map((tour) => {
              const isSelected = selectedTours.includes(String(tour.id));
              return (
                <div
                  key={tour.id}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    transition: 'background 0.12s'
                  }}
                  className="hover:bg-slate-50"
                  onClick={() => toggleTour(String(tour.id))}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#2563eb' }}
                  />
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: isSelected ? '#1d4ed8' : '#1e293b',
                      fontWeight: isSelected ? 600 : 400,
                      lineHeight: 1.35,
                      flex: 1
                    }}
                  >
                    {tour.name}
                  </span>
                </div>
              );
            })}

            {/* Empty search results */}
            {filteredTours.length === 0 && !showNoTourOption && (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                <div>Không tìm thấy tour phù hợp với "{searchTerm}"</div>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    marginTop: 8,
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Xóa từ khóa
                </button>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          {selectedTours.length > 0 && (
            <div style={{
              padding: '6px 12px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#475569'
            }}>
              <span>Đang lọc: <strong>{selectedTours.length}</strong> tour</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 10px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Xong
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TourFilterDropdown;
