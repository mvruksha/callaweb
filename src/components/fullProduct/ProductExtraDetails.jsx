const ProductExtraDetails = ({ product }) => {
  return (
    <div className="bg-gray-50 rounded-xs p-4 shadow-sm">
      <h2 className="font-semibold text-lg mb-2">Extra Details</h2>
      <ul className="space-y-2 text-gray-700">
        {product.flavours && <li>🍰 Flavours Available: {product.flavours}</li>}

        {product.options && (
          <>
            <li>✅ Flavour Selection: {product.options.flavour_selection}</li>
            <li>⚖️ Min Weight: {product.options.minimum_weight_kg} kg</li>
            {product.options.extra_charges && (
              <li>
                💰 Extra Charges:
                {Object.entries(product.options.extra_charges).map(
                  ([size, cost]) => (
                    <span key={size} className="ml-2">
                      {size}: Rs {cost}
                    </span>
                  )
                )}
              </li>
            )}
          </>
        )}

        {product.pricing && <li>💲 Pricing: {product.pricing}</li>}

        {product.examples && (
          <li>🎂 Examples: {product.examples.join(", ")}</li>
        )}

        {product.customization && (
          <>
            <li>🎨 Flavour Choice: {product.customization.flavour_choice}</li>
            <li>✨ Theme Design: {product.customization.theme_design}</li>
            <li>💵 Price Range: {product.customization.price_range}</li>
          </>
        )}
      </ul>
    </div>
  );
};

export default ProductExtraDetails;
