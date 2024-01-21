import styles from "../page.module.css";
import { Ballot } from "../components/Ballot/Ballot";
import BallotModel from "../api/models/Ballot";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { serializeOne } from "@/lib/db";

export default async function BallotPage() {
    const choices = [
        "Yea", "Nay"
    ];

    const motion = `
For the company Learning, Language, and Multicultural Advancement LLC (Company), the members delegate Joseph Roper (joewrotehaikus) and Pragya (kiztbz) as manager and assistant manager respectively. These roles can be defined through service contracts in exchange for capital contributions.

The manager (Joseph Roper) will have full authority to represent the Company and act in the name of the Company in all official acts including but not limited to:
    - Providing funds for the Company with loans (including loans from members or non-members established with Company promissory notes)
    - Providing and accepting money, property, or service for the Company as a capital contribution from members
    - Registering the Company with Virginia and other governing authorities
    - Signing up for accounts with financial institutions to use for spending, receiving payments, applying for loans, and other financial transactions
    - Putting forth an Operating Agreement for members to sign
    - Joining organizations for networking and marketing purposes using above-mentioned funds
    - Offering service contracts with any Company member as the member's capital contribution to the Company and authorizing as the Company
    - Offering service contracts with any Company member or non-member in exchange for money, property, or other service from the Company and authorizing as the Company
    - Acting as the Company's registered agent or designating and paying someone else to be the Company's registered agent
    - Purchasing or renting equipment or services with Company funds
    - Other actions to accomplish the above or other reasonable action to accomplish the Company's goals

The assistant manager (Pragya) may be authorized to do any of the above and more as delegated by the manager.
    - The assistant manager will also review the manager's actions
    - If the action was proposed by the manager beforehand, the assistant manager will be permitted to veto the action, and the manager will not be authorized to take that action
    - If the action was already taken without assistant manager's approval, the assistant manager may voice his disapproval and block future similar actions until they are first approved by the assistant manager
    - The above does not require the manager to seek approval first, however, it is advised when practical

The manager and assistant manager positions will be reviewed by members and can be changed in whole or in part by a simple majority. Members will be given the option to amend the positions, change who holds the position, or otherwise amend the Operating Agreement. If members do not make a motion towards amendment or change, the current arrangement will continue until they do. It is advised that members amend the Operating Agreement and manager and assistant manager positions by July 19, 2024 if not before.

All actions done in the name of the Company and all Company records are to be made available upon request to any member that has signed the Operating Agreement. If any record has private information not pertinent to the requesting member, that information is to be redacted unless the owner of that private information has waived privacy.

Regarding above privacy concerns, each member's name, address, and contact information will be on the Operating Agreement and will be available to all members. Should a member choose greater privacy, they should seek options towards that end, such as a mailing address at a post office and a business phone number.`;

    const voteOptions = {
        numberChoices: 1,
        voteAgainst: false,
        canAmend: true,
    }

    const user = await useUser({ token: cookies().get("token")?.value });
    const ballot = user
        ? await BallotModel.findOne({ voter: user._id, motion })
        : undefined;

    return (
        <main className={styles.main}>
            {!user || !ballot && <Ballot motion={motion} choices={choices} />}
            {user && ballot && (
                <Ballot
                    motion={motion}
                    choices={choices}
                    ballot={serializeOne(ballot)}
                />
            )}
        </main>
    );
}
