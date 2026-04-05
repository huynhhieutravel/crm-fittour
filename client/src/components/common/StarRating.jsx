import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onChange, disabled }) => {
    const [hover, setHover] = useState(0);

    const handleClick = (val) => {
        if (disabled) return;
        onChange(val);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const currentRating = hover || rating || 0;
                    const isActive = currentRating >= star;
                    return (
                        <div 
                            key={star}
                            style={{ 
                                cursor: disabled ? 'default' : 'pointer',
                                transition: 'transform 0.1s',
                                transform: (hover === star && !disabled) ? 'scale(1.2)' : 'scale(1)'
                            }}
                            onMouseEnter={() => !disabled && setHover(star)}
                            onMouseLeave={() => !disabled && setHover(0)}
                            onClick={() => handleClick(star)}
                        >
                            <Star 
                                size={28} 
                                fill={isActive ? "#f59e0b" : "none"} 
                                color={isActive ? "#f59e0b" : "#cbd5e1"} 
                            />
                        </div>
                    );
                })}
            </div>
            {rating > 0 && (
                <span style={{ 
                    marginLeft: '8px', 
                    fontWeight: 'bold', 
                    color: '#f59e0b', 
                    fontSize: '1.1rem',
                    background: '#fef3c7',
                    padding: '2px 8px',
                    borderRadius: '4px'
                }}>
                    {rating}.0
                </span>
            )}
        </div>
    );
};

export default StarRating;
