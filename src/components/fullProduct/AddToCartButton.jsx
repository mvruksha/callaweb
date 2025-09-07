const AddToCartButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-purple-600 hover:bg-purple-700 transition text-white font-medium px-8 py-3 rounded-xs shadow-md"
    >
      Add to Cart
    </button>
  );
};

export default AddToCartButton;
