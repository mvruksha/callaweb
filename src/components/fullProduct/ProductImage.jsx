import Image from "next/image";

const ProductImage = ({ image, title, discount }) => {
  return (
    <div className="relative flex justify-center">
      <Image
        src={image}
        alt={title}
        width={400}
        height={400}
        className="object-contain rounded-lg shadow-md"
      />
      {discount && (
        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-xs shadow-sm">
          {discount}% OFF
        </span>
      )}
    </div>
  );
};

export default ProductImage;
