import React from 'react';
import ProductAttributes from './ProductAttributes';
import ProductVariations from './ProductVariations';

const VariableProduct = ({ formData, setFormData, errors }) => {
  return (
    <div className="space-y-6">
      <ProductAttributes 
        formData={formData} 
        setFormData={setFormData} 
        errors={errors}
      />
      
      <ProductVariations 
        formData={formData} 
        setFormData={setFormData} 
        errors={errors}
      />
    </div>
  );
};

export default VariableProduct;

