import hasCommonItem from "./hasCommonItem";

export default function findPrerequisites(prerequisiteIDs, resourceList) {
    resourceList.filter((r) => {
        return hasCommonItem(
            r.courses.map((c) => c.toString()),
            prerequisiteIDs.map((c) => c.toString()),
        );
    });
}
