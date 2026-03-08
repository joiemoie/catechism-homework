const SCENARIOS = {
    marx: {
        name: "Karl Marx",
        portrait: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Karl_Marx_001.jpg",
        maxPlayerHealth: 5,
        maxOpponentHealth: 5, // Represents 5 logical breakthroughs needed
        startNode: "root",
        nodes: {
            // --- PHASE 1: THE OPIUM ---
            "root": {
                text: "Religion is the sigh of the oppressed creature, the heart of a heartless world, and the soul of soulless conditions. It is the opium of the people.",
                choices: [
                    {
                        text: "Religion prevents chaos! Without it, people would kill each other!",
                        nextNode: "chaos_rebuttal",
                        playerDamage: 1,
                        type: "fallacy",
                        thought: "He sees 'order' as just a tool for control. I walked right into that."
                    },
                    {
                        text: "Are you saying religion is merely a painkiller for the suffering caused by capitalism?",
                        nextNode: "opium_elaboration",
                        playerDamage: 0,
                        opponentDamage: 0, // setup
                        type: "logic"
                    },
                    {
                        text: "You're just jealous because you aren't God!",
                        nextNode: "ad_hominem_1",
                        playerDamage: 2, // Heavy penalty
                        type: "aggro",
                        thought: "That was childish. I need to debate his ideas, not his beard."
                    },
                    {
                        text: "But opium was a medicine in your time. So religion heals?",
                        nextNode: "medicine_trap",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "chaos_rebuttal": {
                text: "Look at who you fear! You fear the starving masses, not the system that starves them! Your 'order' is just violence in a suit. Religion merely blesses the policeman's baton.",
                choices: [
                    {
                        text: "Okay, but surely the moral framework has some value?",
                        nextNode: "morality_value",
                        playerDamage: 0,
                        type: "empathy",
                        thought: "Maybe I can appeal to the good religion does, rather than just control."
                    },
                    {
                        text: "Communism killed way more people!",
                        nextNode: "tu_quoque",
                        playerDamage: 1,
                        type: "fallacy", // Tu Quoque
                        thought: "Falling into the 'whataboutism' trap. He'll just deflect."
                    }
                ]
            },
            "medicine_trap": {
                text: "You are like a doctor who prescribes brandy for a broken leg! You keep the patient drunk so they do not scream, while the bone rots. Why do you fear the surgery of revolution?",
                choices: [
                    {
                        text: "So we must focus on the material conditions that cause the pain.",
                        nextNode: "materialism_pivot",
                        opponentDamage: 1, // HIT 1
                        playerDamage: 0,
                        type: "logic",
                        thought: "I need to meet him on his own ground: materialism."
                    },
                    {
                        text: "Some pain cannot be cured by material means.",
                        nextNode: "existential_pivot",
                        opponentDamage: 0,
                        playerDamage: 0,
                        type: "empathy",
                        thought: "He's ignoring the spiritual dimension of suffering."
                    }
                ]
            },
            "opium_elaboration": {
                text: "Precisely. It is an illusory happiness. The demand to give up illusions about the existing state of affairs is the demand to abandon a state of affairs which needs illusions.",
                choices: [
                    {
                        text: "If we fix the world, will religion vanish?",
                        nextNode: "withering_away",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "Illusions are necessary for human survival.",
                        nextNode: "idealism_trap",
                        playerDamage: 1,
                        type: "fallacy",
                        thought: "Arguments from 'necessity' won't work on a revolutionary."
                    }
                ]
            },
            // --- PHASE 2: MATERIALISM vs IDEALISM ---
            "materialism_pivot": {
                text: "Yes! The criticism of religion ends with the doctrine that man is the supreme being for man. We must overthrow all relations in which man is a debased, enslaved, abandoned, despicable essence.",
                choices: [
                    {
                        text: "But isn't 'man as supreme being' just another religion?",
                        nextNode: "humanism_rebuttal",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 2
                        type: "logic",
                        thought: "Turning his own logic against him. Let's see how he handles that."
                    },
                    {
                        text: "You sound angry.",
                        nextNode: "tone_policing",
                        playerDamage: 1,
                        type: "fallacy",
                        thought: "Tone policing a revolutionary? That's asking for trouble."
                    }
                ]
            },
            "existential_pivot": {
                text: "What pain? All suffering is rooted in material deprivation and alienation from one's labor. Solve the economy, solve the human condition.",
                choices: [
                    {
                        text: "What about death? Grief? Materialism cannot solve mortality.",
                        nextNode: "mortality_check",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT (Alternative path)
                        type: "empathy"
                    },
                    {
                        text: "Rich people are sad too!",
                        nextNode: "bourgeois_sadness",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "withering_away": {
                text: "Inevitably. Once the social roots of religion—oppression and ignorance—are cut, the flower will wither of its own accord.",
                choices: [
                    {
                        text: "History shows religion persists even in secular societies.",
                        nextNode: "secular_persistence",
                        opponentDamage: 1, // HIT
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "I doubt it.",
                        nextNode: "lazy_denial",
                        playerDamage: 1,
                        type: "aggro"
                    }
                ]
            },
            // --- PHASE 3: ALIENATION ---
            "humanism_rebuttal": {
                text: "You project all human power onto a cloud and call it 'God', leaving yourself empty! I say: Pull it back down! Realize that YOU are the creator, YOU are the mover. Why do you despise your own species?",
                choices: [
                    {
                        text: "But if you remove the transcendent, doesn't the state become the new God?",
                        nextNode: "state_idol",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 3
                        type: "logic"
                    },
                    {
                        text: "Labor is boring though.",
                        nextNode: "lazy_denial",
                        playerDamage: 1,
                        type: "aggro"
                    }
                ]
            },
            "mortality_check": {
                text: "Cowardice! You cannot face the darkness, so you invent a nursery rhyme about pearly gates. A grown man accepts that his time is finite and uses it to build a world that survives him.",
                choices: [
                    {
                        text: "That acceptance is a philosophy, indistinguishable from a spiritual stance.",
                        nextNode: "spirituality_defense",
                        opponentDamage: 1, // HIT 3
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "I'm scared of dying!",
                        nextNode: "fear_weakness",
                        playerDamage: 1,
                        type: "empathy"
                    }
                ]
            },
            // --- PHASE 4: THE CLIMAX ---
            "state_idol": {
                text: "The state will wither away! We speak of a free association of producers! You only fear this because you cannot imagine a world without a master holding the leash.",
                choices: [
                    {
                        text: "That requires a change in human nature, which is what religion addresses.",
                        nextNode: "nature_debate",
                        opponentDamage: 0,
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "Your theory is utopian. You are the dreamer, not the religious.",
                        nextNode: "utopian_charge",
                        opponentDamage: 1, // HIT 4
                        playerDamage: 0,
                        type: "aggro"
                    }
                ]
            },
            "utopian_charge": {
                text: "You call me a dreamer because you cannot imagine a world without masters! You are so conditioned to the cage that you think flying is an illness. My 'dream' is inevitable; your 'reality' is a sinking ship.",
                choices: [
                    {
                        text: "Analysis is not prophecy. Your certainty is a form of faith.",
                        nextNode: "faith_trap",
                        opponentDamage: 1, // HIT 5 (VICTORY)
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "Sky-fairies? That's rude.",
                        nextNode: "tone_policing",
                        playerDamage: 1,
                        type: "fallacy"
                    }
                ]
            },
            "secular_persistence": {
                text: "Because they killed the priest but kept the banker! They removed the cross but left the chain. Of course the wound still hurts—the bullet is still inside!",
                choices: [
                    {
                        text: "So the yearning is natural, not just a product of oppression?",
                        nextNode: "humanism_rebuttal", // Merges back to main path
                        opponentDamage: 1, 
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "Shopping malls are great though.",
                        nextNode: "lazy_denial",
                        playerDamage: 1,
                        type: "aggro"
                    }
                ]
            },
            "spirituality_defense": {
                text: "Semantics! You dress up stoicism as religion. But if it comforts you to call your acceptance 'God', so be it. But does it feed the hungry?",
                choices: [
                    {
                        text: "It inspires charity, which feeds the hungry.",
                        nextNode: "charity_rebuttal", // New minor branch or loop
                        opponentDamage: 0,
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "Not directly, but it feeds the spirit.",
                        nextNode: "state_idol", // Merge back
                        opponentDamage: 0,
                        playerDamage: 0,
                        type: "empathy"
                    }
                ]
            },
            "charity_rebuttal": {
                text: "Charity! The humanitarian mask of the exploiter! They give back a fraction of what they stole to soothe their conscience. It keeps the poor alive just enough to keep working.",
                choices: [
                    {
                        text: "Cynicism isn't an argument. Many give selflessly.",
                        nextNode: "humanism_rebuttal",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "empathy"
                    }
                ]
            },
            "morality_value": {
                text: "A morality of slaves! 'Turn the other cheek' is excellent advice... for a factory owner to give his workers. You preach submission and call it virtue.",
                choices: [
                    {
                        text: "But religion often leads the fight against slavery.",
                        nextNode: "secular_persistence", // Redirecting to similar logic
                        playerDamage: 0,
                        opponentDamage: 1,
                        type: "logic"
                    }
                ]
            },
            "bourgeois_sadness": {
                text: "Their sadness is the emptiness of a life devoted to accumulation. It is a different kind of alienation, but alienation nonetheless.",
                choices: [
                    {
                        text: "So everyone is alienated? Then it's a human problem, not just a class one.",
                        nextNode: "nature_debate",
                        playerDamage: 0,
                        opponentDamage: 1,
                        type: "logic"
                    }
                ]
            },
            "idealism_trap": {
                text: "You sound like a Hegelian. Ideas do not drive history; history drives ideas. You are putting the cart before the horse.",
                choices: [
                    {
                        text: "Let's get back to reality then.",
                        nextNode: "materialism_pivot",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "fear_weakness": {
                text: "Fear is a powerful jailer. I wish to break your bars, not comfort you inside your cell.",
                choices: [
                    {
                        text: "I'd rather be comfortable.",
                        nextNode: "defeat",
                        playerDamage: 100, // Instant loss for giving up
                        type: "aggro"
                    },
                    {
                        text: "Show me how to break them.",
                        nextNode: "materialism_pivot",
                        playerDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "nature_debate": {
                text: "Human nature is not fixed! It is the ensemble of social relations. We change our nature by changing our world.",
                choices: [
                    {
                        text: "History suggests greed and tribalism are deeper than that.",
                        nextNode: "utopian_charge",
                        playerDamage: 0,
                        opponentDamage: 1,
                        type: "logic"
                    },
                    {
                        text: "I guess you're right.",
                        nextNode: "state_idol", // Loop back
                        playerDamage: 1, // Weakness penalty
                        type: "empathy"
                    }
                ]
            },
            // --- FAIL STATES ---
            "ad_hominem_1": {
                text: "The poverty of your insults reflects the poverty of your philosophy. I have no time for children.",
                choices: [{ text: "Try again...", nextNode: "RETURN", playerDamage: 0 }]
            },
            "tu_quoque": {
                text: "I am not responsible for what others do in my name, any more than Jesus is responsible for the Inquisition. Stick to the logic!",
                choices: [{ text: "Fair point.", nextNode: "chaos_rebuttal", playerDamage: 0 }]
            },
            "lazy_denial": {
                text: "Assertion is not argument. Read a book.",
                choices: [{ text: "...", nextNode: "RETURN", playerDamage: 0 }]
            },
            "tone_policing": {
                text: "I speak of the suffering of millions, and you worry about my tone? Typical bourgeois fragility.",
                choices: [{ text: "Back to the point.", nextNode: "RETURN", playerDamage: 0 }]
            },
            "faith_trap": {
                text: "I... I simply deduce the future from the present... but... perhaps...",
                choices: [
                    {
                        text: "Logic requires premises. Your premise that matter is all there is... is unprovable.",
                        nextNode: "victory",
                        opponentDamage: 100,
                        playerDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "victory": { text: "Victory", choices: [] },
            "defeat": { text: "Defeat", choices: [] }
        }
    },
    nietzsche: {
        name: "Friedrich Nietzsche",
        portrait: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Nietzsche187a.jpg",
        maxPlayerHealth: 4,
        maxOpponentHealth: 5,
        startNode: "root",
        nodes: {
            "root": {
                text: "God is dead. God remains dead. And we have killed him. How shall we comfort ourselves, the murderers of all murderers?",
                choices: [
                    {
                        text: "He is not dead. He is eternal!",
                        nextNode: "dead_rebuttal",
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "We should feel guilty about this.",
                        nextNode: "pity_trap",
                        playerDamage: 1,
                        type: "empathy", // Nietzsche HATES guilt/pity
                        thought: "Bad move. He views guilt as a sickness of the soul."
                    },
                    {
                        text: "Good riddance! Science killed him.",
                        nextNode: "science_trap",
                        playerDamage: 0,
                        type: "aggro",
                        thought: "Wait, he hates science too? I thought he was on my side here..."
                    }
                ]
            },
            "dead_rebuttal": {
                text: "He rots! Do you not smell the divine decomposition? Churches are just tombs and sepulchers of God now. You cling to a corpse because you fear the open sea!",
                choices: [
                    {
                        text: "If He is dead, then morality is dead too.",
                        nextNode: "nihilism_intro",
                        opponentDamage: 1, // HIT 1
                        playerDamage: 0,
                        type: "logic",
                        thought: "Accepting the premise to show the terrifying conclusion."
                    },
                    {
                        text: "That's offensive!",
                        nextNode: "offended_fail",
                        playerDamage: 1,
                        type: "fallacy",
                        thought: "He feeds on offense. I need to be stronger."
                    }
                ]
            },
            "pity_trap": {
                text: "Guilt! The stroke of the slave! You want to wallow in bad conscience? Christianity has poisoned you; you love your own suffering.",
                choices: [
                    {
                        text: "Compassion is strength, not weakness.",
                        nextNode: "pity_debate",
                        playerDamage: 0,
                        type: "logic",
                        thought: "I have to redefine strength for him."
                    },
                    {
                        text: "Sorry...",
                        nextNode: "weakness_fail",
                        playerDamage: 1,
                        type: "empathy",
                        thought: "Apologizing to Nietzsche? Suicide."
                    }
                ]
            },
            "science_trap": {
                text: "Science? Ha! Science is just the latest ascetic ideal. You have replaced the priest with the professor, but you still worship 'Truth' as a god. You have not broken the chains, only painted them grey.",
                choices: [
                    {
                        text: "So truth does not matter?",
                        nextNode: "truth_debate",
                        playerDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "nihilism_intro": {
                text: "Yes! Morality IS dead! The horizon is free! But you tremble. You are not strong enough to create your own values. You need a shepherd.",
                choices: [
                    {
                        text: "I can create my own meaning without God.",
                        nextNode: "ubermensch_test",
                        opponentDamage: 1, // HIT 2
                        playerDamage: 0,
                        type: "aggro", // Asserting strength is good here
                        thought: "I need to prove I don't need a 'shepherd'."
                    },
                    {
                        text: "Without objective morality, everything is permitted. That is terrifying.",
                        nextNode: "fear_check",
                        playerDamage: 0,
                        type: "empathy",
                        thought: "Honesty about the fear might be respected... or despised."
                    }
                ]
            },
            "ubermensch_test": {
                text: "Brave words! But can you really? Can you stare into the abyss without blinking? Most men are just bridges to the Overman. Are you a bridge, or a goal?",
                choices: [
                    {
                        text: "I am a goal in myself.",
                        nextNode: "ego_trap",
                        playerDamage: 0,
                        type: "aggro",
                        thought: "This sounds like pure vanity. He hates unearned pride."
                    },
                    {
                        text: "I am a bridge. I strive to overcome myself.",
                        nextNode: "self_overcoming",
                        opponentDamage: 1, // HIT 3
                        playerDamage: 0,
                        type: "logic",
                        thought: "Humility and striving? That sounds more like his 'Overman'."
                    }
                ]
            },
            "pity_debate": {
                text: "Compassion is the multiplication of misery! When you pity the suffering, you validate their weakness. You should help them perish so something better can arise!",
                choices: [
                    {
                        text: "That is monstrous. Strength that preys on the weak is brittle.",
                        nextNode: "strength_rebuttal",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT (Alternative)
                        type: "logic"
                    }
                ]
            },
            "self_overcoming": {
                text: "Good! Man is something that must be overcome. What is the ape to man? A laughingstock or a painful embarrassment. And man shall be that to the Overman.",
                choices: [
                    {
                        text: "Does the Overman ignore the suffering of others?",
                        nextNode: "pity_debate", // Merge paths
                        playerDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "So we must destroy the old values.",
                        nextNode: "hammer_time",
                        playerDamage: 0,
                        type: "aggro"
                    }
                ]
            },
            "hammer_time": {
                text: "Philosophize with a hammer! Tap the idols to hear how hollow they are. But be careful—when you destroy, you must be ready to build.",
                choices: [
                    {
                        text: "What if I build the wrong values?",
                        nextNode: "risk_affirmation",
                        opponentDamage: 1, // HIT 4
                        playerDamage: 0,
                        type: "empathy"
                    }
                ]
            },
            "risk_affirmation": {
                text: "There is no 'wrong', only weak or strong! Life-affirming or life-denying! Say YES to life, even to the suffering!",
                choices: [
                    {
                        text: "What about the Eternal Recurrence? Would I say yes to living this life again forever?",
                        nextNode: "recurrence_trap",
                        opponentDamage: 1, // HIT 5 (Victory setup)
                        playerDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "recurrence_trap": {
                text: "The heaviest weight! Imagine a demon says to you: 'This life as you now live it and have lived it, you will have to live once more and innumerable times more.' Would you throw yourself down and gnash your teeth?",
                choices: [
                    {
                        text: "I would curse the demon!",
                        nextNode: "weakness_fail",
                        playerDamage: 1,
                        type: "empathy"
                    },
                    {
                        text: "I would say: You are a god and never have I heard anything more divine.",
                        nextNode: "victory", // Amor Fati
                        opponentDamage: 100,
                        playerDamage: 0,
                        type: "aggro" // Bold affirmation
                    }
                ]
            },
            "truth_debate": {
                text: "Truth is an illusion which we have forgotten is an illusion. It is a metaphor, a coin which has lost its picture. Why not untruth? Why not uncertainty?",
                choices: [
                    {
                        text: "Because we need a foundation to build on.",
                        nextNode: "ubermensch_test", // Merge back
                        playerDamage: 0,
                        opponentDamage: 1, 
                        type: "logic"
                    },
                    {
                        text: "That sounds like chaos.",
                        nextNode: "nihilism_intro",
                        playerDamage: 0,
                        type: "empathy"
                    }
                ]
            },
            "ego_trap": {
                text: "You are a goal? Ha! You are a puffed-up bladder of vanity! You have not yet created anything; you only consume.",
                choices: [
                    {
                        text: "I can learn to create.",
                        nextNode: "self_overcoming",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "strength_rebuttal": {
                text: "Brittle? Perhaps. But better to break than to rot! You want to pad the corners of the world so no one hurts themselves. You want to turn mankind into sand.",
                choices: [
                    {
                        text: "I want to lift everyone up, not just the strong.",
                        nextNode: "weakness_fail",
                        playerDamage: 1,
                        type: "empathy"
                    },
                    {
                        text: "Strength is meaningless without something to fight for.",
                        nextNode: "hammer_time",
                        playerDamage: 0,
                        opponentDamage: 1,
                        type: "logic"
                    }
                ]
            },
            "fear_check": {
                text: "Terrifying? It is the open sea! It is the great liberation! Only the weak tremble when the cage door is opened.",
                choices: [
                    {
                        text: "I will step out then.",
                        nextNode: "ubermensch_test",
                        playerDamage: 0,
                        type: "aggro"
                    }
                ]
            },
            // --- FAIL STATES ---
            "offended_fail": {
                text: "Your indignation is the last refuge of the weak. You cannot argue, so you demand silence.",
                choices: [{ text: "...", nextNode: "RETURN", playerDamage: 0 }]
            },
            "weakness_fail": {
                text: "Pathetic! You are made of the stuff of slaves. Go pray for forgiveness.",
                choices: [{ text: "Start over.", nextNode: "RETURN", playerDamage: 0 }]
            },
            "victory": { text: "Victory", choices: [] },
            "defeat": { text: "Defeat", choices: [] }
        }
    },
    sanger: {
        name: "Margaret Sanger",
        portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Margaret_Sanger_1915_LC-USZ62-29808.jpg/440px-Margaret_Sanger_1915_LC-USZ62-29808.jpg",
        maxPlayerHealth: 5,
        maxOpponentHealth: 5, // 5 logical breakthroughs needed
        startNode: "root",
        nodes: {
            // --- PHASE 1: LIBERTY & HEALTH ---
            "root": {
                text: "No woman can call herself free who does not own and control her own body. Birth control is the first step toward women's liberation and essential for public health.",
                choices: [
                    {
                        text: "Bodily autonomy is important, but what about the unborn?",
                        nextNode: "unborn_question",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic",
                        thought: "Acknowledging her premise might be a trap, but I need to engage it."
                    },
                    {
                        text: "You just want women to be promiscuous!",
                        nextNode: "ad_hominem_sanger",
                        playerDamage: 1,
                        type: "aggro",
                        thought: "Attacking her character just makes me look irrational."
                    },
                    {
                        text: "Contraception is unnatural and immoral.",
                        nextNode: "natural_fallacy",
                        playerDamage: 0,
                        type: "logic",
                        thought: "A solid foundation for the Natural Law argument."
                    }
                ]
            },
            "unborn_question": {
                text: "The early embryo is merely a clump of cells, not a person. It is potential, not actual life, and its potential should not supersede the actual life and liberty of a woman.",
                choices: [
                    {
                        text: "When does this 'clump of cells' become a human being with rights?",
                        nextNode: "personhood_debate",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 1
                        type: "logic",
                        thought: "Forcing her to define personhood is key."
                    },
                    {
                        text: "That sounds like dehumanization to me.",
                        nextNode: "empathy_fail_sanger",
                        playerDamage: 1,
                        type: "empathy",
                        thought: "Emotional appeals just bounce off her 'utilitarian' shield."
                    }
                ]
            },
            "natural_fallacy": {
                text: "Unnatural? Is medicine unnatural? Is civilization unnatural? We strive to improve human conditions, not remain shackled by ignorance. Your argument is rooted in a theological stance, not a practical understanding of human suffering.",
                choices: [
                    {
                        text: "The Catholic Church teaches contraception is against natural law, separating procreation from the marital act.",
                        nextNode: "catholic_natural_law",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "My concern is the sanctity of life.",
                        nextNode: "sanctity_life_sanger",
                        playerDamage: 0,
                        type: "empathy"
                    }
                ]
            },
            "catholic_natural_law": {
                text: "Natural law? A relic! Women suffer under such dogma. Their bodies are their own, to control as they see fit, not as dictated by ancient texts or patriarchal institutions.",
                choices: [
                    {
                        text: "But marital acts should be open to life; contraception distorts this.",
                        nextNode: "procreative_unitive",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT from this new branch
                        type: "logic"
                    },
                    {
                        text: "Such teachings impose undue burdens on women.",
                        nextNode: "empathy_fail_sanger", // Sanger dismisses as weak
                        playerDamage: 1,
                        type: "empathy"
                    }
                ]
            },
            "procreative_unitive": {
                text: "You speak of distortions, but what of the distortion of a woman's life by unwanted pregnancy? The freedom to choose is paramount, not some abstract theological ideal.",
                choices: [
                    {
                        text: "Freedom cannot be divorced from responsibility, especially to the potential for life.",
                        nextNode: "violinist_intro_pre", // Redirect to core pro-life argument, linking to the Violinist
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "Natural Family Planning offers a moral alternative.",
                        nextNode: "nfp_alternative",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "nfp_alternative": {
                text: "A calendar and a thermometer? That is hardly liberation. It is still a shackling of women's autonomy, demanding constant vigilance and restricting spontaneity. It offers little real control.",
                choices: [
                    {
                        text: "It respects natural bodily processes and empowers women through self-knowledge, without violating moral principles.",
                        nextNode: "separate_organism_sanger", // Merges back to main argument about distinct life
                        playerDamage: 0,
                        opponentDamage: 1, // Another HIT if successfully argued
                        type: "logic"
                    },
                    {
                        text: "So any form of family planning is unacceptable to you?",
                        nextNode: "empathy_fail_sanger",
                        playerDamage: 1,
                        type: "aggro"
                    }
                ]
            },
            // --- PHASE 2: THE DARK HISTORY ---
            "personhood_debate": {
                text: "It becomes a person when it can survive independently, or perhaps when it can think and feel. Until then, it is parasitic on the woman's body. Its existence is utterly dependent on her.",
                choices: [
                    {
                        text: "Many dependent people (infants, disabled) are still persons with rights.",
                        nextNode: "dependence_rebuttal",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 2
                        type: "logic"
                    },
                    {
                        text: "Are you suggesting some lives are less valuable?",
                        nextNode: "eugenics_reveal_start",
                        playerDamage: 0,
                        opponentDamage: 0, // Setup for a big reveal
                        type: "aggro" // Aggressive but correct push
                    }
                ]
            },
            "eugenics_reveal_start": {
                text: "Some lives are indeed a burden. We should prevent the birth of children who are destined to be a drag on society, a menace to the race. This is 'The Pivot of Civilization.'",
                choices: [
                    {
                        text: "Are you talking about eugenics and population control?",
                        nextNode: "eugenics_quote_expose",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 3
                        type: "logic"
                    },
                    {
                        text: "That sounds dangerously close to racism and discrimination.",
                        nextNode: "racism_remarks_expose",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 3 (alternative path to same point)
                        type: "empathy"
                    }
                ]
            },
            "dependence_rebuttal": {
                text: "Those are *born* individuals. They have established their presence in the world. An embryo has not. It is still part of the woman's body, entirely within her domain.",
                choices: [
                    {
                        text: "But a fetus has its own unique DNA and heartbeat. It's not just a part of her body.",
                        nextNode: "separate_organism_sanger",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 3 (alternative to eugenics reveal)
                        type: "logic"
                    },
                    {
                        text: "So you only care about those who are already 'established'?",
                        nextNode: "eugenics_reveal_start", // Direct to exposing her
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "aggro"
                    }
                ]
            },
            // --- PHASE 3: THE VIOLINIST ---
            "eugenics_quote_expose": {
                text: "Yes, I spoke of racial betterment! For the protection of the weak from becoming parents. It is a compassionate aim, to improve the human race. And yes, my work focused on the unfit. But let us return to autonomy.\n\nImagine you wake up one morning to find yourself strapped to a famous unconscious violinist. He has a fatal kidney ailment, and you alone have the right blood type to hook up to him for nine months. If you unplug yourself, he dies. Do you have an obligation to remain?",
                choices: [
                    {
                        text: "No, I don't. It's my body, my choice.",
                        nextNode: "violinist_fail_sanger",
                        playerDamage: 1,
                        type: "aggro",
                        thought: "Wait, if I agree, I lose the entire pro-life argument!"
                    },
                    {
                        text: "The violinist argument is flawed. It's about 'letting die', not 'killing'.",
                        nextNode: "violinist_counter_1",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 4
                        type: "logic",
                        thought: "I need to attack the analogy itself, not the conclusion."
                    },
                    {
                        text: "This analogy ignores parental responsibility.",
                        nextNode: "violinist_counter_2",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 4 (alternative)
                        type: "logic",
                        thought: "Parents have duties strangers don't. That's the missing piece."
                    }
                ]
            },
            "racism_remarks_expose": {
                text: "My work was for the betterment of all! Even Negro women, who faced immense burdens. If that meant encouraging them to limit family size for their own good, then so be it. It was about improving the quality, not the quantity, of life. But let us return to autonomy.\n\nImagine you wake up one morning to find yourself strapped to a famous unconscious violinist. He has a fatal kidney ailment, and you alone have the right blood type to hook up to him for nine months. If you unplug yourself, he dies. Do you have an obligation to remain?",
                choices: [
                    {
                        text: "No, I don't. It's my body, my choice.",
                        nextNode: "violinist_fail_sanger",
                        playerDamage: 1,
                        type: "aggro"
                    },
                    {
                        text: "The violinist argument is flawed. It's about 'letting die', not 'killing'.",
                        nextNode: "violinist_counter_1",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 4
                        type: "logic"
                    },
                    {
                        text: "This analogy ignores parental responsibility.",
                        nextNode: "violinist_counter_2",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 4 (alternative)
                        type: "logic"
                    }
                ]
            },
            "separate_organism_sanger": {
                text: "A distinct genetic code does not confer personhood. A heart-beat is merely a biological function. If it cannot survive outside the womb, it is not an independent being with rights that outweigh the woman's.",
                choices: [
                    {
                        text: "Viability is an arbitrary line. Dependence does not negate humanity.",
                        nextNode: "eugenics_reveal_start", // Redirect to exposing her
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "So if I need a kidney transplant, I can't ask for one?",
                        nextNode: "violinist_intro_pre",
                        playerDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "violinist_intro_pre": {
                text: "That is a false analogy. A person with kidney failure is an independent individual. A fetus is not. However, let me present a more precise thought experiment: Imagine you wake up one morning to find yourself strapped to a famous unconscious violinist...",
                choices: [
                    {
                        text: "Continue with the Violinist argument.",
                        nextNode: "violinist_counter_1", // Go straight to countering
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 4
                        type: "logic"
                    }
                ]
            },

            // --- PHASE 4: THE HUMANITY OF THE UNBORN ---
            "violinist_counter_1": {
                text: "'Letting die' versus 'killing'? A convenient distinction. If you unplug him, he dies by your action. Your inaction is an action. Is it not?",
                choices: [
                    {
                        text: "The state of being 'hooked up' is involuntary, unlike pregnancy.",
                        nextNode: "pregnancy_analogy_sanger",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 5 (VICTORY)
                        type: "logic",
                        thought: "Crucial distinction. Pregnancy isn't kidnapping (usually)."
                    },
                    {
                        text: "You're just trying to trick me with words.",
                        nextNode: "ad_hominem_sanger",
                        playerDamage: 1,
                        type: "fallacy",
                        thought: "Don't get defensive. Stick to the logic."
                    }
                ]
            },
            "violinist_counter_2": {
                text: "Parental responsibility? The woman is merely a host! To force her to carry an unwanted pregnancy to term is involuntary servitude. No one should be forced to use their body to sustain another.",
                choices: [
                    {
                        text: "A parent has a unique responsibility to their child that a random person does not.",
                        nextNode: "parental_duty_sanger",
                        playerDamage: 0,
                        opponentDamage: 1, // HIT 5 (VICTORY)
                        type: "logic"
                    },
                    {
                        text: "So children are a burden to be discarded?",
                        nextNode: "empathy_fail_sanger",
                        playerDamage: 1,
                        type: "empathy"
                    }
                ]
            },
            "pregnancy_analogy_sanger": {
                text: "Involuntary? Many pregnancies are unintended. Are we to force a woman to carry a child conceived in rape, or through failed contraception? Is that liberty?",
                choices: [
                    {
                        text: "No, but even in those cases, the fetus is a distinct life with a right to exist.",
                        nextNode: "victory",
                        opponentDamage: 100,
                        playerDamage: 0,
                        type: "logic"
                    }
                ]
            },
            "parental_duty_sanger": {
                text: "Duty? Nature's chains! You speak of duty, but I speak of freedom! To force a woman into motherhood against her will is to enslave her.",
                choices: [
                    {
                        text: "Freedom cannot exist without responsibility, especially to the most vulnerable.",
                        nextNode: "victory",
                        opponentDamage: 100,
                        playerDamage: 0,
                        type: "logic"
                    }
                ]
            },
            // --- FAIL STATES ---
            "ad_hominem_sanger": {
                text: "Such base accusations reveal your own prejudices. We are discussing fundamental rights, not tabloid gossip.",
                choices: [{ text: "Return to the argument.", nextNode: "RETURN", playerDamage: 0 }]
            },
            "empathy_fail_sanger": {
                text: "Sentimentality! You clutch at emotions when logic fails you. This is a matter of reason and control, not tearful appeals.",
                choices: [{ text: "Regroup.", nextNode: "RETURN", playerDamage: 0 }]
            },
            "violinist_fail_sanger": {
                text: "Exactly! You prove my point! A woman has the right to detach from a life-sustaining dependency, even if that life perishes. Now, do you understand?",
                choices: [{ text: "I need to rethink this.", nextNode: "RETURN", playerDamage: 0 }]
            },
            "sanctity_life_sanger": {
                text: "The sanctity of a woman's life, her mental and physical well-being, her ability to choose her destiny – these are paramount. What of the sanctity of a life condemned to poverty, disease, or unwantedness?",
                choices: [
                    {
                        text: "All human life has intrinsic value, regardless of circumstances.",
                        nextNode: "personhood_debate",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "logic"
                    },
                    {
                        text: "You're arguing for quality of life over life itself.",
                        nextNode: "eugenics_reveal_start",
                        playerDamage: 0,
                        opponentDamage: 0,
                        type: "aggro"
                    }
                ]
            }
        }
    }
};