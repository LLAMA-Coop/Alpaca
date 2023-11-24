import Category from "@/app/api/models/Category";
import { User } from "@/app/api/models";
import { Card, ListItem } from "../client";
import styles from "../note/NoteDisplay.module.css";

export async function CategoryDisplay({ category }) {
    const user = await User.findById(category.createdBy);
    const dbCat = await Category.findById(category._id)
        .populate("subcategoryOf")
        .populate("prerequisites.category");

    return (
        <Card
            title={`${dbCat.name}`}
            description={`${dbCat.description}`}
        >
            <div className={styles.tags}>
                <h5>This Category is a Subcategory Of . . .</h5>
                {dbCat.subcategoryOf.length > 0 ? (
                    <ol className="chipList">
                        {dbCat.subcategoryOf.map((cat) => {
                            return <ListItem key={cat._id} item={cat.name} />
                        })}
                    </ol>
                ) : (
                    <p>No Subcategories Listed</p>
                )}
            </div>

            <div className={styles.tags}>
                <h5>Prerequisites for this Category</h5>
                {dbCat.prerequisites.length > 0 ? (
                    <ol className="chipList">
                        {dbCat.prerequisites.map((cat) => (
                            <ListItem key={cat._id} item={cat.name} />
                        ))}
                    </ol>
                ) : (
                    <p>No Prerequisites Listed</p>
                )}
            </div>
        </Card>
    );
}
