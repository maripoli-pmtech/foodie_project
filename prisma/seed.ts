import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean database in FK-safe order before seeding
  await prisma.recipeIngredient.deleteMany()
  await prisma.mealSlot.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.ingredient.deleteMany()

  console.log('🗑️  Cleared existing data')

  // ---------------------------------------------------------------------------
  // Upsert all ingredients (idempotent by name)
  // ---------------------------------------------------------------------------
  const ingredients = await Promise.all([
    // Produce
    prisma.ingredient.upsert({ where: { name: 'onion' }, update: {}, create: { name: 'onion', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'garlic' }, update: {}, create: { name: 'garlic', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'ginger' }, update: {}, create: { name: 'ginger', category: 'produce', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'broccoli' }, update: {}, create: { name: 'broccoli', category: 'produce', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'bell pepper' }, update: {}, create: { name: 'bell pepper', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'carrot' }, update: {}, create: { name: 'carrot', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'romaine lettuce' }, update: {}, create: { name: 'romaine lettuce', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'lemon' }, update: {}, create: { name: 'lemon', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'spinach' }, update: {}, create: { name: 'spinach', category: 'produce', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'potato' }, update: {}, create: { name: 'potato', category: 'produce', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'banana' }, update: {}, create: { name: 'banana', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'asparagus' }, update: {}, create: { name: 'asparagus', category: 'produce', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'avocado' }, update: {}, create: { name: 'avocado', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'lime' }, update: {}, create: { name: 'lime', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'red onion' }, update: {}, create: { name: 'red onion', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'cilantro' }, update: {}, create: { name: 'cilantro', category: 'produce', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'tomato' }, update: {}, create: { name: 'tomato', category: 'produce', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'blueberries' }, update: {}, create: { name: 'blueberries', category: 'produce', defaultUnit: 'g' } }),

    // Meat
    prisma.ingredient.upsert({ where: { name: 'ground beef' }, update: {}, create: { name: 'ground beef', category: 'meat', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'chicken breast' }, update: {}, create: { name: 'chicken breast', category: 'meat', defaultUnit: 'g' } }),

    // Seafood
    prisma.ingredient.upsert({ where: { name: 'salmon fillet' }, update: {}, create: { name: 'salmon fillet', category: 'seafood', defaultUnit: 'g' } }),

    // Dairy
    prisma.ingredient.upsert({ where: { name: 'parmesan cheese' }, update: {}, create: { name: 'parmesan cheese', category: 'dairy', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'butter' }, update: {}, create: { name: 'butter', category: 'dairy', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'milk' }, update: {}, create: { name: 'milk', category: 'dairy', defaultUnit: 'ml' } }),
    prisma.ingredient.upsert({ where: { name: 'sour cream' }, update: {}, create: { name: 'sour cream', category: 'dairy', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'yogurt' }, update: {}, create: { name: 'yogurt', category: 'dairy', defaultUnit: 'g' } }),

    // Pantry
    prisma.ingredient.upsert({ where: { name: 'spaghetti' }, update: {}, create: { name: 'spaghetti', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'canned tomatoes' }, update: {}, create: { name: 'canned tomatoes', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'tomato paste' }, update: {}, create: { name: 'tomato paste', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'olive oil' }, update: {}, create: { name: 'olive oil', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'soy sauce' }, update: {}, create: { name: 'soy sauce', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'sesame oil' }, update: {}, create: { name: 'sesame oil', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'cornstarch' }, update: {}, create: { name: 'cornstarch', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'rice' }, update: {}, create: { name: 'rice', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'croutons' }, update: {}, create: { name: 'croutons', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'caesar dressing' }, update: {}, create: { name: 'caesar dressing', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'coconut milk' }, update: {}, create: { name: 'coconut milk', category: 'pantry', defaultUnit: 'ml' } }),
    prisma.ingredient.upsert({ where: { name: 'chickpeas' }, update: {}, create: { name: 'chickpeas', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'flour' }, update: {}, create: { name: 'flour', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'baking powder' }, update: {}, create: { name: 'baking powder', category: 'pantry', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'maple syrup' }, update: {}, create: { name: 'maple syrup', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'tortillas' }, update: {}, create: { name: 'tortillas', category: 'pantry', defaultUnit: 'piece' } }),
    prisma.ingredient.upsert({ where: { name: 'black beans' }, update: {}, create: { name: 'black beans', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'rolled oats' }, update: {}, create: { name: 'rolled oats', category: 'pantry', defaultUnit: 'g' } }),
    prisma.ingredient.upsert({ where: { name: 'honey' }, update: {}, create: { name: 'honey', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'chia seeds' }, update: {}, create: { name: 'chia seeds', category: 'pantry', defaultUnit: 'tbsp' } }),
    prisma.ingredient.upsert({ where: { name: 'eggs' }, update: {}, create: { name: 'eggs', category: 'pantry', defaultUnit: 'piece' } }),

    // Spices
    prisma.ingredient.upsert({ where: { name: 'salt' }, update: {}, create: { name: 'salt', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'pepper' }, update: {}, create: { name: 'pepper', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'dried oregano' }, update: {}, create: { name: 'dried oregano', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'dried basil' }, update: {}, create: { name: 'dried basil', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'curry powder' }, update: {}, create: { name: 'curry powder', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'cumin' }, update: {}, create: { name: 'cumin', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'turmeric' }, update: {}, create: { name: 'turmeric', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'dill' }, update: {}, create: { name: 'dill', category: 'spices', defaultUnit: 'tsp' } }),
    prisma.ingredient.upsert({ where: { name: 'chili powder' }, update: {}, create: { name: 'chili powder', category: 'spices', defaultUnit: 'tsp' } }),
  ])

  // Build a lookup map for convenience
  const ing = Object.fromEntries(ingredients.map((i) => [i.name, i]))

  console.log(`✅ Upserted ${ingredients.length} ingredients`)

  // ---------------------------------------------------------------------------
  // Recipe 1: Classic Spaghetti Bolognese
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Classic Spaghetti Bolognese',
      description: 'A hearty Italian meat sauce slow-cooked with tomatoes and herbs, served over al dente spaghetti.',
      instructions: `## Classic Spaghetti Bolognese

1. Bring a large pot of salted water to a boil.
2. Heat olive oil in a large pan over medium heat. Add diced onion and cook for 5 minutes until softened.
3. Add minced garlic and cook for 1 minute.
4. Add ground beef and cook, breaking it up, until browned. Drain excess fat.
5. Stir in tomato paste and cook for 2 minutes.
6. Add canned tomatoes, dried oregano, and dried basil. Season with salt and pepper.
7. Simmer on low heat for 30 minutes, stirring occasionally.
8. Cook spaghetti according to package instructions until al dente. Drain.
9. Serve sauce over spaghetti, topped with grated parmesan.`,
      servings: 4,
      prepTime: 10,
      cookTime: 40,
      tags: ['italian', 'pasta', 'comfort food'],
      ingredients: {
        create: [
          { ingredientId: ing['spaghetti'].id, quantity: 400, unit: 'g' },
          { ingredientId: ing['ground beef'].id, quantity: 500, unit: 'g' },
          { ingredientId: ing['onion'].id, quantity: 1, unit: 'piece', notes: 'finely diced' },
          { ingredientId: ing['garlic'].id, quantity: 3, unit: 'piece', notes: 'minced' },
          { ingredientId: ing['canned tomatoes'].id, quantity: 400, unit: 'g' },
          { ingredientId: ing['tomato paste'].id, quantity: 2, unit: 'tbsp' },
          { ingredientId: ing['olive oil'].id, quantity: 2, unit: 'tbsp' },
          { ingredientId: ing['salt'].id, quantity: 1, unit: 'tsp' },
          { ingredientId: ing['pepper'].id, quantity: 0.5, unit: 'tsp' },
          { ingredientId: ing['dried oregano'].id, quantity: 1, unit: 'tsp' },
          { ingredientId: ing['dried basil'].id, quantity: 1, unit: 'tsp' },
          { ingredientId: ing['parmesan cheese'].id, quantity: 50, unit: 'g', notes: 'freshly grated, to serve' },
        ],
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Recipe 2: Chicken Stir-Fry
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Chicken Stir-Fry',
      description: 'A quick and healthy Asian-inspired stir-fry packed with colourful vegetables and tender chicken.',
      instructions: `## Chicken Stir-Fry

1. Cook rice according to package instructions and set aside.
2. Slice chicken breast into thin strips. Toss with cornstarch, salt, and pepper.
3. Mix soy sauce and sesame oil in a small bowl; set aside.
4. Heat oil in a wok or large pan over high heat. Add chicken and stir-fry for 4–5 minutes until golden. Remove and set aside.
5. Add garlic and ginger to the wok; cook for 30 seconds.
6. Add broccoli, bell pepper, and carrot. Stir-fry for 3–4 minutes until tender-crisp.
7. Return chicken to the wok, pour over sauce, and toss to coat.
8. Serve immediately over steamed rice.`,
      servings: 4,
      prepTime: 15,
      cookTime: 15,
      tags: ['asian', 'quick', 'healthy'],
      ingredients: {
        create: [
          { ingredientId: ing['chicken breast'].id, quantity: 600, unit: 'g', notes: 'sliced thin' },
          { ingredientId: ing['soy sauce'].id, quantity: 3, unit: 'tbsp' },
          { ingredientId: ing['sesame oil'].id, quantity: 1, unit: 'tbsp' },
          { ingredientId: ing['broccoli'].id, quantity: 300, unit: 'g', notes: 'cut into florets' },
          { ingredientId: ing['bell pepper'].id, quantity: 1, unit: 'piece', notes: 'sliced' },
          { ingredientId: ing['carrot'].id, quantity: 2, unit: 'piece', notes: 'julienned' },
          { ingredientId: ing['garlic'].id, quantity: 3, unit: 'piece', notes: 'minced' },
          { ingredientId: ing['ginger'].id, quantity: 15, unit: 'g', notes: 'grated' },
          { ingredientId: ing['cornstarch'].id, quantity: 1, unit: 'tbsp' },
          { ingredientId: ing['rice'].id, quantity: 300, unit: 'g' },
          { ingredientId: ing['salt'].id, quantity: 0.5, unit: 'tsp' },
          { ingredientId: ing['pepper'].id, quantity: 0.25, unit: 'tsp' },
        ],
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Recipe 3: Caesar Salad
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Caesar Salad',
      description: 'Crisp romaine lettuce with grilled chicken, crunchy croutons, and a creamy Caesar dressing.',
      instructions: `## Caesar Salad

1. Season chicken breast with salt, pepper, and olive oil. Grill or pan-fry for 6–7 minutes per side until cooked through. Rest for 5 minutes, then slice.
2. Tear romaine lettuce into bite-sized pieces and place in a large bowl.
3. Add croutons and half the parmesan.
4. Drizzle with Caesar dressing and toss well.
5. Top with sliced chicken, remaining parmesan, and a squeeze of lemon.`,
      servings: 2,
      prepTime: 10,
      cookTime: 15,
      tags: ['salad', 'quick', 'lunch'],
      ingredients: {
        create: [
          { ingredientId: ing['romaine lettuce'].id, quantity: 2, unit: 'piece', notes: 'hearts, roughly torn' },
          { ingredientId: ing['parmesan cheese'].id, quantity: 40, unit: 'g', notes: 'shaved' },
          { ingredientId: ing['croutons'].id, quantity: 60, unit: 'g' },
          { ingredientId: ing['caesar dressing'].id, quantity: 4, unit: 'tbsp' },
          { ingredientId: ing['chicken breast'].id, quantity: 300, unit: 'g' },
          { ingredientId: ing['lemon'].id, quantity: 0.5, unit: 'piece' },
          { ingredientId: ing['garlic'].id, quantity: 1, unit: 'piece', notes: 'minced, for dressing' },
          { ingredientId: ing['olive oil'].id, quantity: 1, unit: 'tbsp' },
          { ingredientId: ing['salt'].id, quantity: 0.5, unit: 'tsp' },
          { ingredientId: ing['pepper'].id, quantity: 0.25, unit: 'tsp' },
        ],
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Recipe 4: Vegetable Curry
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Vegetable Curry',
      description: 'A fragrant, creamy Indian-style vegetable curry with chickpeas, spinach, and potato.',
      instructions: `## Vegetable Curry

1. Cook rice according to package instructions.
2. Heat oil in a large pot over medium heat. Add diced onion and cook for 5 minutes.
3. Add minced garlic and grated ginger; cook for 2 minutes.
4. Stir in curry powder, cumin, and turmeric; cook for 1 minute until fragrant.
5. Add tomato paste and cook for 1 minute.
6. Add diced potato, chickpeas, and coconut milk. Bring to a simmer.
7. Cook for 15 minutes until potato is tender.
8. Stir in spinach and cook for 2 minutes until wilted.
9. Season with salt and serve over rice.`,
      servings: 4,
      prepTime: 15,
      cookTime: 30,
      tags: ['vegetarian', 'indian', 'comfort food'],
      ingredients: {
        create: [
          { ingredientId: ing['chickpeas'].id, quantity: 400, unit: 'g', notes: 'drained and rinsed' },
          { ingredientId: ing['coconut milk'].id, quantity: 400, unit: 'ml' },
          { ingredientId: ing['onion'].id, quantity: 1, unit: 'piece', notes: 'diced' },
          { ingredientId: ing['garlic'].id, quantity: 3, unit: 'piece', notes: 'minced' },
          { ingredientId: ing['ginger'].id, quantity: 20, unit: 'g', notes: 'grated' },
          { ingredientId: ing['tomato paste'].id, quantity: 2, unit: 'tbsp' },
          { ingredientId: ing['spinach'].id, quantity: 150, unit: 'g', notes: 'fresh' },
          { ingredientId: ing['potato'].id, quantity: 400, unit: 'g', notes: 'cut into 2cm cubes' },
          { ingredientId: ing['curry powder'].id, quantity: 2, unit: 'tsp' },
          { ingredientId: ing['cumin'].id, quantity: 1, unit: 'tsp' },
          { ingredientId: ing['turmeric'].id, quantity: 0.5, unit: 'tsp' },
          { ingredientId: ing['rice'].id, quantity: 300, unit: 'g' },
          { ingredientId: ing['salt'].id, quantity: 1, unit: 'tsp' },
          { ingredientId: ing['olive oil'].id, quantity: 2, unit: 'tbsp' },
        ],
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Recipe 5: Banana Pancakes
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Banana Pancakes',
      description: 'Fluffy, naturally sweet pancakes made with ripe bananas — perfect for a quick weekend breakfast.',
      instructions: `## Banana Pancakes

1. Mash bananas in a large bowl until smooth.
2. Whisk in eggs and milk.
3. Fold in flour, baking powder, and salt until just combined — do not overmix.
4. Melt butter in a non-stick pan over medium heat.
5. Pour ¼ cup batter per pancake. Cook for 2–3 minutes until bubbles form on the surface.
6. Flip and cook for another 1–2 minutes until golden.
7. Serve warm with maple syrup.`,
      servings: 2,
      prepTime: 5,
      cookTime: 15,
      tags: ['breakfast', 'quick', 'vegetarian'],
      ingredients: {
        create: [
          { ingredientId: ing['banana'].id, quantity: 2, unit: 'piece', notes: 'ripe, mashed' },
          { ingredientId: ing['eggs'].id, quantity: 2, unit: 'piece' },
          { ingredientId: ing['flour'].id, quantity: 120, unit: 'g' },
          { ingredientId: ing['milk'].id, quantity: 150, unit: 'ml' },
          { ingredientId: ing['baking powder'].id, quantity: 1, unit: 'tsp' },
          { ingredientId: ing['butter'].id, quantity: 20, unit: 'g', notes: 'for frying' },
          { ingredientId: ing['maple syrup'].id, quantity: 2, unit: 'tbsp', notes: 'to serve' },
          { ingredientId: ing['salt'].id, quantity: 0.25, unit: 'tsp' },
        ],
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Recipe 6: Grilled Salmon with Asparagus
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Grilled Salmon with Asparagus',
      description: 'Simple, elegant pan-grilled salmon fillets with lemon-garlic asparagus.',
      instructions: `## Grilled Salmon with Asparagus

1. Preheat a griddle or grill pan over high heat.
2. Toss asparagus with olive oil, salt, and pepper.
3. Season salmon fillets with salt, pepper, and fresh dill.
4. Grill salmon for 4–5 minutes per side until cooked through.
5. While salmon grills, cook asparagus on the same grill for 3–4 minutes, turning occasionally.
6. Slice garlic and scatter over asparagus during the last minute.
7. Serve salmon and asparagus with lemon wedges.`,
      servings: 2,
      prepTime: 5,
      cookTime: 12,
      tags: ['seafood', 'healthy', 'dinner'],
      ingredients: {
        create: [
          { ingredientId: ing['salmon fillet'].id, quantity: 400, unit: 'g', notes: '2 fillets, skin-on' },
          { ingredientId: ing['asparagus'].id, quantity: 250, unit: 'g', notes: 'woody ends trimmed' },
          { ingredientId: ing['olive oil'].id, quantity: 2, unit: 'tbsp' },
          { ingredientId: ing['lemon'].id, quantity: 1, unit: 'piece', notes: 'cut into wedges' },
          { ingredientId: ing['garlic'].id, quantity: 2, unit: 'piece', notes: 'thinly sliced' },
          { ingredientId: ing['salt'].id, quantity: 0.5, unit: 'tsp' },
          { ingredientId: ing['pepper'].id, quantity: 0.25, unit: 'tsp' },
          { ingredientId: ing['dill'].id, quantity: 1, unit: 'tsp', notes: 'fresh or dried' },
        ],
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Recipe 7: Black Bean Tacos
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Black Bean Tacos',
      description: 'Quick and flavourful vegetarian tacos with spiced black beans, fresh avocado, and all the toppings.',
      instructions: `## Black Bean Tacos

1. Drain and rinse black beans. Place in a pan over medium heat.
2. Add cumin and chili powder; stir and cook for 3–4 minutes until heated through and lightly spiced. Season with salt.
3. Warm tortillas in a dry pan for 30 seconds per side.
4. Halve and slice the avocado. Dice tomato. Finely slice red onion. Roughly chop cilantro.
5. Assemble tacos: spoon beans onto tortillas, top with avocado, tomato, red onion, sour cream, and cilantro.
6. Squeeze lime over each taco before serving.`,
      servings: 4,
      prepTime: 10,
      cookTime: 10,
      tags: ['mexican', 'vegetarian', 'quick'],
      ingredients: {
        create: [
          { ingredientId: ing['black beans'].id, quantity: 400, unit: 'g', notes: 'drained and rinsed' },
          { ingredientId: ing['tortillas'].id, quantity: 8, unit: 'piece', notes: 'small flour or corn' },
          { ingredientId: ing['avocado'].id, quantity: 2, unit: 'piece', notes: 'sliced' },
          { ingredientId: ing['lime'].id, quantity: 2, unit: 'piece' },
          { ingredientId: ing['red onion'].id, quantity: 0.5, unit: 'piece', notes: 'finely sliced' },
          { ingredientId: ing['cilantro'].id, quantity: 15, unit: 'g', notes: 'roughly chopped' },
          { ingredientId: ing['cumin'].id, quantity: 1, unit: 'tsp' },
          { ingredientId: ing['chili powder'].id, quantity: 0.5, unit: 'tsp' },
          { ingredientId: ing['sour cream'].id, quantity: 100, unit: 'g' },
          { ingredientId: ing['tomato'].id, quantity: 2, unit: 'piece', notes: 'diced' },
          { ingredientId: ing['salt'].id, quantity: 0.5, unit: 'tsp' },
        ],
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Recipe 8: Overnight Oats
  // ---------------------------------------------------------------------------
  await prisma.recipe.create({
    data: {
      title: 'Overnight Oats',
      description: 'Creamy, no-cook oats prepared the night before for a nutritious, grab-and-go breakfast.',
      instructions: `## Overnight Oats

1. In a jar or bowl, combine rolled oats, milk, yogurt, honey, and chia seeds.
2. Stir well to combine.
3. Cover and refrigerate overnight (at least 6 hours).
4. In the morning, give the oats a stir. Add a splash of milk if too thick.
5. Top with sliced banana and blueberries before serving.`,
      servings: 1,
      prepTime: 5,
      cookTime: 0,
      tags: ['breakfast', 'meal prep', 'healthy'],
      ingredients: {
        create: [
          { ingredientId: ing['rolled oats'].id, quantity: 80, unit: 'g' },
          { ingredientId: ing['milk'].id, quantity: 150, unit: 'ml' },
          { ingredientId: ing['yogurt'].id, quantity: 100, unit: 'g', notes: 'plain or Greek' },
          { ingredientId: ing['honey'].id, quantity: 1, unit: 'tbsp' },
          { ingredientId: ing['chia seeds'].id, quantity: 1, unit: 'tbsp' },
          { ingredientId: ing['banana'].id, quantity: 0.5, unit: 'piece', notes: 'sliced' },
          { ingredientId: ing['blueberries'].id, quantity: 60, unit: 'g' },
        ],
      },
    },
  })

  console.log('🌱 Seeded 8 recipes successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
