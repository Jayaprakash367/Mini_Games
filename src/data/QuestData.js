export const QUEST_DATA = [
    {
        id: 'harbor_delivery',
        title: 'Harbor Package',
        description: 'Deliver an important package to Captain Morgan at the harbor.',
        giverNpcId: 'postmaster',
        introText: 'Welcome, new messenger! I have your first delivery assignment.',
        descriptionText: 'Captain Morgan at the harbor is waiting for an important package. Please deliver it promptly.',
        steps: [
            {
                npcId: 'harbor_chief',
                description: 'Deliver the package to Captain Morgan at the harbor.',
                giveItem: { id: 'harbor_package', name: 'Harbor Package', icon: '📦', description: 'A sealed package for the Harbor Chief' },
                requireItem: 'harbor_package',
                deliveryResponse: 'Ah, the new messenger! Do you have my package?',
                playerLine: 'Yes, here is your delivery from the Post Office.',
                thankLine: 'Excellent! This contains our new shipping manifests. Thank you, messenger. The harbor runs on timely deliveries like yours.'
            }
        ],
        reward: {
            description: '10 Gold Coins',
            item: { id: 'gold_coins', name: 'Gold Coins', icon: '🪙', description: 'Shiny gold coins', quantity: 10 }
        }
    },
    {
        id: 'lost_letter',
        title: 'The Lost Letter',
        description: 'Find and return Elara\'s lost letter from the park.',
        giverNpcId: 'writer',
        introText: 'Oh, you\'re the messenger! I\'m in a terrible predicament.',
        descriptionText: 'I lost a very important letter somewhere near the park pond. It contains the ending to my novel. Could you find it?',
        steps: [
            {
                npcId: 'librarian',
                description: 'Ask Miss Beatrice if she found Elara\'s letter.',
                deliveryResponse: 'A lost letter? Actually, someone turned in a letter they found near the pond yesterday.',
                playerLine: 'That must be Elara\'s! She\'s been looking for it.',
                thankLine: 'Here you go. Tell Elara she should be more careful with her manuscripts!',
                giveItem: { id: 'elara_letter', name: 'Elara\'s Letter', icon: '✉️', description: 'A letter containing novel ending' }
            },
            {
                npcId: 'writer',
                description: 'Return the letter to Elara.',
                requireItem: 'elara_letter',
                deliveryResponse: 'You found it! Please, is that my letter?',
                playerLine: 'Miss Beatrice had it. Someone found it by the pond.',
                thankLine: 'My novel\'s ending is saved! You are a true hero of literature, messenger.'
            }
        ],
        reward: {
            description: 'Rare Quill Pen',
            item: { id: 'quill_pen', name: 'Quill Pen', icon: '🪶', description: 'A beautiful quill pen from Elara' }
        }
    },
    {
        id: 'lunch_delivery',
        title: 'Lighthouse Lunch',
        description: 'Deliver Chef Rosaria\'s lunch to Old Thomas at the lighthouse.',
        giverNpcId: 'chef',
        introText: 'Messenger! Perfect timing. I need your help.',
        descriptionText: 'Old Thomas ordered his lunch but he can\'t leave the lighthouse. Could you bring it to him? It\'s his favorite — seafood stew!',
        steps: [
            {
                npcId: 'lighthouse_keeper',
                description: 'Bring the lunch to Old Thomas at the lighthouse.',
                giveItem: { id: 'lunch_box', name: 'Seafood Stew', icon: '🍲', description: 'Chef Rosaria\'s famous seafood stew' },
                requireItem: 'lunch_box',
                deliveryResponse: 'Is that what I think it is? Rosaria\'s stew?',
                playerLine: 'Fresh from the market! Chef Rosaria sends her regards.',
                thankLine: 'Bless that woman and bless you, messenger! Nothing beats her stew on a cold night at the lighthouse.'
            }
        ],
        reward: {
            description: 'Lighthouse Charm',
            item: { id: 'lighthouse_charm', name: 'Lighthouse Charm', icon: '🏮', description: 'A small lighthouse charm from Thomas' }
        }
    },
    {
        id: 'telescope_lens',
        title: 'Stargazer\'s Lens',
        description: 'Pick up a telescope lens from Merchant Felix and deliver it to Professor Stellan.',
        giverNpcId: 'observatory_keeper',
        introText: 'Ah, young messenger! The stars have sent you to me.',
        descriptionText: 'I ordered a new lens for my telescope from Merchant Felix. My old legs can\'t make the trip down the hill. Would you fetch it for me?',
        steps: [
            {
                npcId: 'merchant',
                description: 'Pick up the telescope lens from Merchant Felix.',
                deliveryResponse: 'The professor\'s lens? Yes, I have it right here.',
                playerLine: 'Professor Stellan sent me to pick it up.',
                thankLine: 'Here you go — be careful with it! That\'s precision Venetian glass. Tell the Professor clear skies!',
                giveItem: { id: 'telescope_lens', name: 'Telescope Lens', icon: '🔭', description: 'A precision glass lens for the observatory telescope' }
            },
            {
                npcId: 'observatory_keeper',
                description: 'Deliver the telescope lens to Professor Stellan.',
                requireItem: 'telescope_lens',
                deliveryResponse: 'You\'re back! Is that my new lens?',
                playerLine: 'Merchant Felix says to wish you clear skies.',
                thankLine: 'Magnificent! Tonight the nebulae will reveal their secrets. You\'ve done the stars a service, young messenger!'
            }
        ],
        reward: {
            description: 'Star Map',
            item: { id: 'star_map', name: 'Star Map', icon: '🗺️', description: 'A beautiful hand-drawn map of the constellations' }
        }
    },
    {
        id: 'harbor_manifest',
        title: 'Shipping Manifest',
        description: 'Bring Captain Morgan\'s shipping manifest to Merchant Felix.',
        giverNpcId: 'harbor_chief',
        introText: 'Messenger, I have another job for you.',
        descriptionText: 'I need this shipping manifest delivered to Merchant Felix in the market. His new goods have arrived at the port.',
        steps: [
            {
                npcId: 'merchant',
                description: 'Deliver the manifest to Merchant Felix.',
                giveItem: { id: 'manifest', name: 'Shipping Manifest', icon: '📋', description: 'A list of newly arrived goods at the harbor' },
                requireItem: 'manifest',
                deliveryResponse: 'About time! Let me see that manifest.',
                playerLine: 'Captain Morgan sent this — your new goods have arrived.',
                thankLine: 'Wonderful! Silks from the east and spices from the south. Business will be booming! Thank you, messenger.'
            }
        ],
        reward: {
            description: 'Merchant\'s Discount Token',
            item: { id: 'discount_token', name: 'Discount Token', icon: '🎟️', description: 'Good for one free item at Felix\'s shop' }
        }
    }
];
