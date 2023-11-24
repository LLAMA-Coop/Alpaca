import { CategoryInput } from "../components/category/CategoryInput";
import { canEdit, useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import styles from "@/app/page.module.css";
import Category from "../api/models/Category";
import { CategoryDisplay } from "../components/category/CategoryDisplay";
import { InputPopup } from "../components/client";
import { serializeOne } from "@/lib/db";

export default async function CategoriesPage({ searchParams }) {
    const user = await useUser({ token: cookies().get("token")?.value });
    const categories = await Category.find();

    return (
        <main className={styles.main}>
            {categories.length > 0 && (
                <section>
                    <h3>Available Categories</h3>

                    <ol className={styles.listGrid}>
                        {categories.map((cat) => (
                            <li key={cat._id}>
                                <CategoryDisplay category={cat} />
                                {user && canEdit(cat, user) && (
                                    <InputPopup
                                        type="category"
                                        resource={serializeOne(cat)}
                                    />
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            {user && (
                <section>
                    <h3>Create new category</h3>

                    <CategoryInput />
                </section>
            )}
        </main>
    );
}
