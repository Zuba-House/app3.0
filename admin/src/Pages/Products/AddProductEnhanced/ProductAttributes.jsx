import React, { useState } from 'react';
import { FaPlus, FaTrash, FaTag } from 'react-icons/fa';

const ProductAttributes = ({ formData, setFormData, errors }) => {
  const [newAttribute, setNewAttribute] = useState({ name: '', values: [] });
  const [newValue, setNewValue] = useState('');

  const addAttribute = () => {
    if (!newAttribute.name.trim()) return;

    const attribute = {
      name: newAttribute.name.trim(),
      slug: newAttribute.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      values: newAttribute.values.map(val => ({
        label: val.trim(),
        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      })),
      visible: true,
      variation: true
    };

    setFormData(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), attribute]
    }));

    setNewAttribute({ name: '', values: [] });
    setNewValue('');
  };

  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const addValueToAttribute = (attributeIndex) => {
    if (!newValue.trim()) return;

    setFormData(prev => {
      const updated = [...prev.attributes];
      const existingValues = updated[attributeIndex].values.map(v => v.label.toLowerCase());
      
      if (!existingValues.includes(newValue.trim().toLowerCase())) {
        updated[attributeIndex].values.push({
          label: newValue.trim(),
          slug: newValue.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
      }

      return {
        ...prev,
        attributes: updated
      };
    });

    setNewValue('');
  };

  const removeValueFromAttribute = (attributeIndex, valueIndex) => {
    setFormData(prev => {
      const updated = [...prev.attributes];
      updated[attributeIndex].values = updated[attributeIndex].values.filter((_, i) => i !== valueIndex);
      return {
        ...prev,
        attributes: updated
      };
    });
  };

  return (
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e5e2db' }}>
        <FaTag style={{ color: '#efb291' }} />
        Product Attributes
      </h2>

      {errors.attributes && (
        <p className="text-red-500 text-sm mb-4">{errors.attributes}</p>
      )}

      {/* Existing Attributes */}
      {formData.attributes && formData.attributes.length > 0 && (
        <div className="space-y-4 mb-6">
          {formData.attributes.map((attribute, attrIndex) => (
            <div
              key={attrIndex}
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg" style={{ color: '#efb291' }}>
                  {attribute.name}
                </h3>
                <button
                  type="button"
                  onClick={() => removeAttribute(attrIndex)}
                  className="p-2 rounded-full hover:bg-red-500 transition-colors"
                  style={{ color: '#ef4444' }}
                >
                  <FaTrash />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {attribute.values.map((value, valIndex) => (
                  <span
                    key={valIndex}
                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                  >
                    {value.label}
                    <button
                      type="button"
                      onClick={() => removeValueFromAttribute(attrIndex, valIndex)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add value (e.g., Red, Small)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addValueToAttribute(attrIndex);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                />
                <button
                  type="button"
                  onClick={() => addValueToAttribute(attrIndex)}
                  className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                >
                  <FaPlus className="inline mr-1" />
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Attribute */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: '#0b2735', border: '2px dashed rgba(239, 178, 145, 0.5)' }}
      >
        <h3 className="font-bold mb-3" style={{ color: '#e5e2db' }}>
          Add New Attribute
        </h3>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Attribute name (e.g., Color, Size)"
            value={newAttribute.name}
            onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg outline-none mb-2"
            style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
          />
          <div className="flex flex-wrap gap-2 mb-2">
            {newAttribute.values.map((val, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
              >
                {val}
                <button
                  type="button"
                  onClick={() => {
                    setNewAttribute(prev => ({
                      ...prev,
                      values: prev.values.filter((_, i) => i !== index)
                    }));
                  }}
                  className="ml-2 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add value (e.g., Red)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newValue.trim()) {
                    setNewAttribute(prev => ({
                      ...prev,
                      values: [...prev.values, newValue.trim()]
                    }));
                    setNewValue('');
                  }
                }
              }}
              className="flex-1 px-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: '#1a3d52', color: '#e5e2db', border: '1px solid rgba(239, 178, 145, 0.2)' }}
            />
            <button
              type="button"
              onClick={() => {
                if (newValue.trim()) {
                  setNewAttribute(prev => ({
                    ...prev,
                    values: [...prev.values, newValue.trim()]
                  }));
                  setNewValue('');
                }
              }}
              className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: '#efb291', color: '#0b2735' }}
            >
              <FaPlus className="inline mr-1" />
              Add Value
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={addAttribute}
          disabled={!newAttribute.name.trim() || newAttribute.values.length === 0}
          className="w-full px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#efb291', color: '#0b2735' }}
        >
          <FaPlus className="inline mr-2" />
          Add Attribute
        </button>
      </div>
    </div>
  );
};

export default ProductAttributes;

