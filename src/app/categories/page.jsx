import CategoriesPage from "@/components/categoriespage/CategoriesPage";
import Titletag from "@/components/titletag/Titletag";
import React from "react";

const Categories = () => {
  return (
    <>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Categories"
      />
      <CategoriesPage />
    </>
  );
};

export default Categories;
