"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useEffect, useState } from "react";

const dashColumnCountBp = {
    500: 1,
    1000: 2,
    1500: 3,
    2000: 4,
    2500: 5,
    3000: 6,
    3500: 7,
    4000: 8,
    4500: 9,
    5000: 10,
    5500: 11,
    6000: 12,
    6500: 13,
    7000: 14,
    7500: 15,
    8000: 16,
};

const dash2ColumnCountBp = {
    450: 1,
    900: 2,
    1350: 3,
    1800: 4,
};

const defaultColumnCountBp = {
    650: 1,
    1024: 2,
};

export function MasoneryList({ children, ...props }) {
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        setHasLoaded(true);
    }, []);

    if (!hasLoaded) {
        return null;
    }

    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={
                props.dash
                    ? dashColumnCountBp
                    : props.dash2
                    ? dash2ColumnCountBp
                    : defaultColumnCountBp
            }
        >
            <Masonry gutter="24px">{children}</Masonry>
        </ResponsiveMasonry>
    );
}
