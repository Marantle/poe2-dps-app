function extractDamageRanges(input) {
    console.log('Input:', input);
    const damageTypes = ['Physical Damage', 'Fire Damage', 'Cold Damage', 'Lightning Damage', 'Chaos Damage'];
    let damageRanges = {};

    // Extract specific damage types
    damageTypes.forEach(type => {
        const regex = new RegExp(`${type}:\\s*(\\d+)-(\\d+)`, 'i');
        const match = input.match(regex);
        if (match) {
            damageRanges[type] = { min: parseInt(match[1]), max: parseInt(match[2]) };
            console.log(`Matched ${type}:`, match);
        }
    });

    // Extract elemental damage using the provided regex
    const elementalRegex = /(?<=Elemental Damage: )(\d+-\d+)(?=,|\s|$|$$augmented$$)|(?<=,\s)(\d+-\d+)(?=,|\s|$|$$augmented$$)/g;
    const elementalMatches = [...input.matchAll(elementalRegex)];
    const elementalRanges = elementalMatches.map(match => match[1] || match[2]);
    
    console.log('Elemental Ranges:', elementalRanges);

    elementalRanges.forEach((range, index) => {
        const [min, max] = range.split('-').map(num => parseInt(num));
        damageRanges[`Elemental ${index + 1}`] = { min, max };
        console.log(`Parsed Elemental ${index + 1}:`, { min, max });
    });

    console.log('Final damageRanges:', damageRanges);
    return damageRanges;
}

function calculateDPS(damageRanges, attacksPerSecond) {
    let totalDamage = 0;
    for (const [, range] of Object.entries(damageRanges)) {
        totalDamage += (range.min + range.max) / 2;
    }
    return totalDamage * attacksPerSecond;
}

function extractAttacksPerSecond(input) {
    const match = input.match(/Attacks per Second:\s*([\d.]+)/);
    return match ? parseFloat(match[1]) : 1;
}

function assertAlmostEqual(actual, expected, message) {
    const roundedActual = Math.round(actual * 100) / 100;
    const roundedExpected = Math.round(expected * 100) / 100;
    console.assert(roundedActual === roundedExpected, `${message}: Expected ${roundedExpected}, but got ${roundedActual}`);
}

// Test cases
const testCases = [
    {
        input: `Item Class: Crossbows
Rarity: Rare
Soul Core
Expert Bombard Crossbow
--------
Quality: +20% (augmented)
Physical Damage: 201-579 (augmented)
Critical Hit Chance: 5.00%
Attacks per Second: 1.65
Reload Time: 0.75
--------
Requirements:
Level: 79
Str: 81 (augmented)
Dex: 81 (augmented)
--------
Sockets: S S 
--------
Item Level: 82
--------
40% increased Physical Damage (rune)
--------
Grenade Skills Fire an additional Projectile (implicit)
--------
195% increased Physical Damage
Adds 26 to 47 Physical Damage
+123 to Accuracy Rating
30% reduced Attribute Requirements
+22 to Strength
+27 to Dexterity`,
        expectedDamageRanges: {
            'Physical Damage': { min: 201, max: 579 }
        },
        expectedDPS: 643.50
    },
    {
        input: `Item Class: Quarterstaves
Rarity: Rare
Oblivion Gnarl
Expert Crackling Quarterstaff
--------
Elemental Damage: 39-57 (augmented), 43-172 (augmented)
Critical Hit Chance: 11.90% (augmented)
Attacks per Second: 1.40
--------
Requirements:
Level: 78
Dex: 165
Int: 64 (unmet)
--------
Item Level: 80
--------
Adds 39 to 57 Fire Damage
+92 to Accuracy Rating
+1.9% to Critical Hit Chance
+29 to Intelligence
30% increased Stun Duration`,
        expectedDamageRanges: {
            'Elemental 1': { min: 39, max: 57 },
            'Elemental 2': { min: 43, max: 172 }
        },
        expectedDPS: 217.70
    },
    {
        input: `Item Class: Bows
Rarity: Rare
Cataclysm Wing
Expert Shortbow
--------
Physical Damage: 41-76
Elemental Damage: 5-9 (augmented), 23-26 (augmented)
Critical Hit Chance: 8.53% (augmented)
Attacks per Second: 1.25
--------
Requirements:
Level: 67
Dex: 174 (unmet)
--------
Item Level: 80
--------
Adds 5 to 9 Fire Damage
Adds 23 to 26 Cold Damage
+3.53% to Critical Hit Chance
+6 to Dexterity`,
        expectedDamageRanges: {
            'Physical Damage': { min: 41, max: 76 },
            'Elemental 1': { min: 5, max: 9 },
            'Elemental 2': { min: 23, max: 26 }
        },
        expectedDPS: 112.50
    }
];

testCases.forEach((testCase, index) => {
    console.log(`\n--- Test Case ${index + 1} ---`);
    const extractedRanges = extractDamageRanges(testCase.input);
    console.log('Extracted Ranges:', extractedRanges);

    // Assert damage ranges
    for (const [damageType, expectedRange] of Object.entries(testCase.expectedDamageRanges)) {
        console.assert(extractedRanges[damageType] !== undefined, `${damageType} should be present`);
        assertAlmostEqual(extractedRanges[damageType].min, expectedRange.min, `${damageType} min`);
        assertAlmostEqual(extractedRanges[damageType].max, expectedRange.max, `${damageType} max`);
    }

    // Calculate and assert DPS
    const attacksPerSecond = extractAttacksPerSecond(testCase.input);
    const calculatedDPS = calculateDPS(extractedRanges, attacksPerSecond);
    assertAlmostEqual(calculatedDPS, testCase.expectedDPS, 'DPS');

    console.log('------------------------\n');
});

