"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

const columnCountBp = {
    350: 1,
    750: 2,
    1100: 3,
};

export function MasoneryList({ children }) {
    return (
        <ResponsiveMasonry columnsCountBreakPoints={columnCountBp}>
            <Masonry gutter="24px">{children}</Masonry>
        </ResponsiveMasonry>
    );
}
