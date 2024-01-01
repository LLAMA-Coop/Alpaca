import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Ballot from "../models/Ballot";
import { unauthorized, server } from "@/lib/apiErrorResponses";
import SubmitErrors from "@/lib/SubmitErrors";

export async function POST(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) {
            return unauthorized;
        }

        const submitErrors = new SubmitErrors();

        const { motion, firstChoice, secondChoice, thirdChoice, voteAgainst } =
            await req.json();

        if (!motion) {
            submitErrors.addError("Missing the motion you are voting on");
        }
        if (!firstChoice) {
            submitErrors.addError("Missing vote");
        }

        if (submitErrors.cannotSend) {
            return NextResponse.json(
                {
                    message: submitErrors.displayErrors(),
                },
                { status: 400 },
            );
        }

        const ballot = new Ballot({
            voter: user,
            motion,
            firstChoice,
            secondChoice,
            thirdChoice,
            voteAgainst,
            amendment,
        });

        const content = await ballot.save();

        return NextResponse.json(
            {
                message: "Ballot received",
                content,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Ballot] POST error: ${error}`);
        return server;
    }
}

export async function PUT(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const {
            _id,
            motion,
            firstChoice,
            secondChoice,
            thirdChoice,
            voteAgainst,
            amendment,
        } = await req.json();

        const ballot = await Ballot.findById(_id);
        if (!ballot) {
            return NextResponse.json(
                {
                    message: `No ballot found with id ${_id}`,
                },
                { status: 404 },
            );
        }

        if (ballot.voter.toString() !== user._id.toString()) {
            return NextResponse.json(
                {
                    message: `You are editing the wrong ballot`,
                },
                { status: 403 },
            );
        }

        if (firstChoice) {
            ballot.firstChoice = firstChoice;
        }
        if (secondChoice) {
            ballot.secondChoice = secondChoice;
        }
        if (thirdChoice) {
            ballot.thirdChoice = thirdChoice;
        }
        if (voteAgainst) {
            ballot.voteAgainst = voteAgainst;
        }
        if (amendment) {
            ballot.amendment = amendment;
        }

        const content = await ballot.save();
        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Ballot] PUT error: ${error}`);
        return server;
    }
}
