const ballots = [
    {
        heading: "Written Waiver of Notice",
        questions: [
            {
                motion: "I acknowledge that I did not receive 10 days notice of this meeting. In accordance with our Operating Agreement in 4.4, I waive my notice and consent to attend the member meeting on March 6, 2024.",
                choices: ["Waive notice", "Do not waive notice"],
                options: {
                    numberChoices: 1,
                    voteAgainst: false,
                    canAmend: false,
                },
            },
            {
                motion: "Confirm name",
                choices: ["Type name"],
                options: {
                    numberChoices: 1,
                    voteAgainst: false,
                    canAmend: false,
                },
            },
        ],
    },
    {
        heading: "President",
        questions: [
            {
                motion: "Who would you like to be President of the Company and Board of Directors?",
                choices: ["Alex", "Joe", "Kiz", "Mart"],
            },
        ],
    },
    {
        heading: "Treasurer",
        questions: [
            {
                motion: "Who would you like to be Treasurer of the Company and Board of Directors?",
                choices: ["Alex", "Joe", "Kiz", "Mart"],
            },
        ],
    },
    {
        heading: "Secretary",
        questions: [
            {
                motion: "Who would you like to be Secretary of the Board of Directors?",
                choices: ["Alex", "Joe", "Kiz", "Mart"],
            },
        ],
    },
];

export default ballots;
