import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Chọn sản phẩm...", 
  style = {}, 
  className = "",
  shortLabel = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.id.toString() === value?.toString());
  
  let label = placeholder;
  if (selectedOption) {
    if (shortLabel && selectedOption.code) {
      label = selectedOption.code;
    } else {
      label = selectedOption.code ? `[${selectedOption.code}] ${selectedOption.name}` : selectedOption.name;
    }
  }
  const displayLabel = label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (opt.code && opt.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`searchable-select-container ${className}`} ref={dropdownRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div 
        className="modal-select searchable-select-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: '0.75rem 1rem',
          minHeight: '45px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px'
        }}
      >
        <span style={{ 
          whiteSpace: 'normal', 
          fontSize: '0.8rem',
          lineHeight: '1.2',
          overflow: 'hidden', 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          color: selectedOption ? '#1e293b' : '#94a3b8',
          fontWeight: selectedOption ? 600 : 400
        }}>
          {displayLabel}
        </span>
        <ChevronDown size={16} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>

      {isOpen && (
        <div 
          className="searchable-select-dropdown animate-fade-in" 
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 5px)', 
            left: 0, 
            right: 0, 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                autoFocus
                type="text" 
                placeholder="Tìm sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 8px 8px 32px', 
                  fontSize: '0.85rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '6px',
                  outline: 'none',
                  background: 'white'
                }} 
              />
              {searchTerm && (
                <X 
                  size={14} 
                  color="#94a3b8" 
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                />
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id} 
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{ 
                    padding: '10px 12px', 
                    fontSize: '0.85rem', 
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: value?.toString() === opt.id.toString() ? '#eff6ff' : 'transparent',
                    color: value?.toString() === opt.id.toString() ? '#2563eb' : '#334155',
                    fontWeight: value?.toString() === opt.id.toString() ? 600 : 400,
                    margin: '2px 0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = value?.toString() === opt.id.toString() ? '#eff6ff' : '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.background = value?.toString() === opt.id.toString() ? '#eff6ff' : 'transparent'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {opt.code && <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 800 }}>{opt.code}</span>}
                    <span style={{ fontSize: '0.85rem' }}>{opt.name}</span>
                  </div>
                  {value?.toString() === opt.id.toString() && <Check size={14} color="#2563eb" />}
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Không tìm thấy sản phẩm
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
