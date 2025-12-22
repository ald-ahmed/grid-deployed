import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../common/entities/product.entity";
import { Tag } from "../common/entities/tag.entity";
import { ProductTag } from "../common/entities/product-tag.entity";
import { Supplier } from "../common/entities/supplier.entity";
import { Category } from "../common/entities/category.entity";
import { faker } from "@faker-js/faker";

import {
  IServerSideGetRowsRequest,
  LoadSuccessParams,
  FilterModel,
  AdvancedFilterModel,
} from "ag-grid-community";
import { ServerSideRequest } from "../common/dto/pagination.dto";

// Using AG Grid's LoadSuccessParams type for proper typing
export type ServerSideResponse = LoadSuccessParams<Product>;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(ProductTag)
    private productTagRepository: Repository<ProductTag>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async getServerSideData(
    request: ServerSideRequest
  ): Promise<ServerSideResponse> {
    console.warn(
      "WARNING: Loading ALL products into memory - this is inefficient!"
    );

    // INEFFICIENT: Loading ALL products with all relationships
    const allProducts = await this.productRepository.find({
      relations: [
        "tags",
        "supplier",
        "category",
        "category.parent",
        "category.parent.parent",
      ],
      order: {
        id: "ASC", // Default ordering
      },
    });

    // Add calculated fields to each product (inefficient!)
    const productsWithCalculatedFields: Product[] = allProducts.map(
      (product) => ({
        ...product,
        distinct_tag_count: product.tags ? product.tags.length : 0,
        total_value: product.price * product.quantity,
      })
    );

    // Process filtering in JavaScript (BAD!)
    let filteredProducts = [...productsWithCalculatedFields];

    // Apply filters if present
    if (request.filterModel) {
      filteredProducts = this.applyFiltersInMemory(
        filteredProducts,
        request.filterModel
      );
    }

    // Apply sorting in JavaScript (BAD!)
    if (request.sortModel && request.sortModel.length > 0) {
      filteredProducts = this.applySortingInMemory(
        filteredProducts,
        request.sortModel
      );
    }

    // Apply grouping in JavaScript (if needed)
    if (request.rowGroupCols && request.rowGroupCols.length > 0) {
      // TODO: Implement grouping (this is complex and should be done in the database!)
      console.warn("Grouping not implemented in this inefficient version");
    }

    // Paginate in JavaScript (BAD!)
    const startRow = request.startRow || 0;
    const endRow = request.endRow || 100;
    const paginatedProducts = filteredProducts.slice(startRow, endRow);

    return {
      rowData: paginatedProducts,
      rowCount: filteredProducts.length, // Total count after filtering
    };
  }

  /**
   * Inefficient in-memory filtering
   * This should be replaced with database WHERE clauses
   */
  private applyFiltersInMemory(
    products: Product[],
    filterModel: any
  ): Product[] {
    // Check if it's an advanced filter model
    if (filterModel.filterType === "join" && filterModel.conditions) {
      // Advanced filter - not implemented in inefficient version
      console.warn(
        "Advanced filters not supported in inefficient implementation"
      );
      return products;
    }

    // Simple column filters
    let filtered = [...products];

    for (const [field, filter] of Object.entries(filterModel)) {
      if (!filter || typeof filter !== "object") continue;

      const filterDef = filter as any;

      filtered = filtered.filter((product) => {
        const value = this.getFieldValue(product, field);

        // Handle different filter types
        if (filterDef.filterType === "text") {
          return this.applyTextFilter(value, filterDef);
        } else if (filterDef.filterType === "number") {
          return this.applyNumberFilter(value, filterDef);
        } else if (filterDef.filterType === "set") {
          return this.applySetFilter(value, filterDef);
        } else if (filterDef.filterType === "date") {
          return this.applyDateFilter(value, filterDef);
        }

        return true;
      });
    }

    return filtered;
  }

  /**
   * Get nested field value from product
   */
  private getFieldValue(product: any, field: string): any {
    const parts = field.split(".");
    let value = product;

    for (const part of parts) {
      if (value == null) return null;
      value = value[part];
    }

    return value;
  }

  /**
   * Apply text filter in memory
   */
  private applyTextFilter(value: any, filter: any): boolean {
    if (value == null) return false;

    const stringValue = String(value).toLowerCase();
    const filterValue = String(filter.filter || "").toLowerCase();

    switch (filter.type) {
      case "contains":
        return stringValue.includes(filterValue);
      case "notContains":
        return !stringValue.includes(filterValue);
      case "equals":
        return stringValue === filterValue;
      case "notEqual":
        return stringValue !== filterValue;
      case "startsWith":
        return stringValue.startsWith(filterValue);
      case "endsWith":
        return stringValue.endsWith(filterValue);
      default:
        return true;
    }
  }

  /**
   * Apply number filter in memory
   */
  private applyNumberFilter(value: any, filter: any): boolean {
    const numValue = Number(value);
    if (isNaN(numValue)) return false;

    const filterValue = Number(filter.filter);
    if (isNaN(filterValue)) return true;

    switch (filter.type) {
      case "equals":
        return numValue === filterValue;
      case "notEqual":
        return numValue !== filterValue;
      case "lessThan":
        return numValue < filterValue;
      case "lessThanOrEqual":
        return numValue <= filterValue;
      case "greaterThan":
        return numValue > filterValue;
      case "greaterThanOrEqual":
        return numValue >= filterValue;
      case "inRange":
        const filterTo = Number(filter.filterTo);
        return numValue >= filterValue && numValue <= filterTo;
      default:
        return true;
    }
  }

  /**
   * Apply set filter in memory
   */
  private applySetFilter(value: any, filter: any): boolean {
    if (!filter.values || !Array.isArray(filter.values)) return true;

    // For array fields like tags
    if (Array.isArray(value)) {
      return value.some((item) =>
        filter.values.includes(typeof item === "object" ? item.name : item)
      );
    }

    return filter.values.includes(value);
  }

  /**
   * Apply date filter in memory
   */
  private applyDateFilter(value: any, filter: any): boolean {
    if (!value) return false;

    const dateValue = new Date(value);
    const filterDate = new Date(filter.dateFrom);

    switch (filter.type) {
      case "equals":
        return dateValue.toDateString() === filterDate.toDateString();
      case "notEqual":
        return dateValue.toDateString() !== filterDate.toDateString();
      case "lessThan":
        return dateValue < filterDate;
      case "greaterThan":
        return dateValue > filterDate;
      case "inRange":
        const dateTo = new Date(filter.dateTo);
        return dateValue >= filterDate && dateValue <= dateTo;
      default:
        return true;
    }
  }

  /**
   * Inefficient in-memory sorting
   * This should be replaced with database ORDER BY
   */
  private applySortingInMemory(
    products: Product[],
    sortModel: any[]
  ): Product[] {
    if (!sortModel || sortModel.length === 0) return products;

    return [...products].sort((a, b) => {
      for (const sort of sortModel) {
        const field = sort.colId;
        const direction = sort.sort === "asc" ? 1 : -1;

        const aValue = this.getFieldValue(a, field);
        const bValue = this.getFieldValue(b, field);

        // Handle null/undefined values
        if (aValue == null && bValue == null) continue;
        if (aValue == null) return direction;
        if (bValue == null) return -direction;

        // Compare values
        let comparison = 0;
        if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        if (comparison !== 0) {
          return comparison * direction;
        }
      }

      return 0;
    });
  }

  /**
   * Get all products (used for other operations)
   */
  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ["tags", "supplier", "category"],
    });
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["tags", "supplier", "category"],
    });

    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Get all tags
   */
  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ["parent", "children"],
    });
  }

  /**
   * Get all suppliers
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    return this.supplierRepository.find();
  }

  async seedData(): Promise<void> {
    // Clear existing data (order matters due to foreign key constraints)
    await this.productTagRepository.createQueryBuilder().delete().execute();
    await this.productRepository.createQueryBuilder().delete().execute();
    await this.tagRepository.createQueryBuilder().delete().execute();
    await this.categoryRepository.createQueryBuilder().delete().execute();
    await this.supplierRepository.createQueryBuilder().delete().execute();

    faker.seed(12345); // Fixed seed for reproducible results

    // First, create tags with random faker data
    const tags: Partial<Tag>[] = [];
    const tagCategories = [
      () => faker.commerce.productAdjective(),
      () => faker.hacker.adjective(),
      () => faker.color.human(),
      () => faker.commerce.productMaterial(),
      () => `${faker.number.int({ min: 2020, max: 2024 })} Edition`,
      () => `${faker.location.country()} Made`,
      () => faker.company.buzzAdjective(),
    ];

    // Generate exactly 20 unique tags for more predictable testing
    const numTags = 20;
    const usedNames = new Set<string>();

    // Add some specific tags that are useful for testing
    const specificTags = [
      "premium",
      "wireless",
      "smart",
      "eco-friendly",
      "lightweight",
      "waterproof",
      "bluetooth",
      "rechargeable",
      "compact",
      "professional",
    ];

    // Add specific tags first
    for (const tagName of specificTags) {
      if (tags.length < numTags && !usedNames.has(tagName)) {
        usedNames.add(tagName);
        tags.push({ name: tagName });
      }
    }

    // Fill remaining slots with generated tags
    while (tags.length < numTags) {
      const nameGenerator = faker.helpers.arrayElement(tagCategories);
      let name = nameGenerator();

      // Clean up the name - capitalize first letter, remove extra spaces
      name = name.trim().toLowerCase().replace(/\s+/g, " ");
      name = name.charAt(0).toUpperCase() + name.slice(1);

      // Ensure uniqueness
      if (!usedNames.has(name)) {
        usedNames.add(name);
        tags.push({ name });
      }
    }

    const savedTags = await this.tagRepository.save(tags);
    console.log(`Created ${savedTags.length} tags`);

    // Create suppliers with realistic data
    const suppliers: Partial<Supplier>[] = [];
    const countries = [
      "United States",
      "Germany",
      "Japan",
      "China",
      "South Korea",
      "Taiwan",
      "Netherlands",
      "Sweden",
      "Switzerland",
      "Canada",
      "United Kingdom",
      "France",
      "Italy",
      "Australia",
      "Singapore",
    ];

    for (let i = 0; i < 25; i++) {
      const companyName = faker.company.name();
      const country = faker.helpers.arrayElement(countries);
      const reliabilityScore = faker.number.float({
        min: 1.0,
        max: 10.0,
        fractionDigits: 1,
      });

      suppliers.push({
        name: companyName,
        country,
        reliabilityScore,
      });
    }

    const savedSuppliers = await this.supplierRepository.save(suppliers);
    console.log(`Created ${savedSuppliers.length} suppliers`);

    // Create categories with hierarchical structure
    const parentCategories: Partial<Category>[] = [
      { name: "Electronics", taxRate: 0.08 },
      { name: "Clothing", taxRate: 0.06 },
      { name: "Home & Garden", taxRate: 0.07 },
      { name: "Sports & Outdoors", taxRate: 0.065 },
      { name: "Books & Media", taxRate: 0.05 },
      { name: "Health & Beauty", taxRate: 0.075 },
      { name: "Automotive", taxRate: 0.085 },
      { name: "Toys & Games", taxRate: 0.06 },
    ];

    const savedParentCategories = await this.categoryRepository.save(
      parentCategories
    );
    console.log(`Created ${savedParentCategories.length} parent categories`);

    // Create subcategories
    const subCategories: Partial<Category>[] = [];

    // Electronics subcategories
    const electronicsParent = savedParentCategories.find(
      (c) => c.name === "Electronics"
    );
    subCategories.push(
      { name: "Smartphones", taxRate: 0.08, parent: electronicsParent },
      { name: "Laptops", taxRate: 0.08, parent: electronicsParent },
      { name: "Audio Equipment", taxRate: 0.08, parent: electronicsParent },
      { name: "Gaming", taxRate: 0.08, parent: electronicsParent }
    );

    // Clothing subcategories
    const clothingParent = savedParentCategories.find(
      (c) => c.name === "Clothing"
    );
    subCategories.push(
      { name: "Men's Clothing", taxRate: 0.06, parent: clothingParent },
      { name: "Women's Clothing", taxRate: 0.06, parent: clothingParent },
      { name: "Shoes", taxRate: 0.06, parent: clothingParent },
      { name: "Accessories", taxRate: 0.06, parent: clothingParent }
    );

    // Home & Garden subcategories
    const homeParent = savedParentCategories.find(
      (c) => c.name === "Home & Garden"
    );
    subCategories.push(
      { name: "Furniture", taxRate: 0.07, parent: homeParent },
      { name: "Kitchen & Dining", taxRate: 0.07, parent: homeParent },
      { name: "Garden Tools", taxRate: 0.07, parent: homeParent },
      { name: "Home Decor", taxRate: 0.07, parent: homeParent }
    );

    // Sports subcategories
    const sportsParent = savedParentCategories.find(
      (c) => c.name === "Sports & Outdoors"
    );
    subCategories.push(
      { name: "Fitness Equipment", taxRate: 0.065, parent: sportsParent },
      { name: "Outdoor Gear", taxRate: 0.065, parent: sportsParent },
      { name: "Team Sports", taxRate: 0.065, parent: sportsParent }
    );

    const savedSubCategories = await this.categoryRepository.save(
      subCategories
    );
    console.log(`Created ${savedSubCategories.length} subcategories`);

    // Create some third-level categories
    const thirdLevelCategories: Partial<Category>[] = [];

    // Electronics third-level categories
    const smartphonesCategory = savedSubCategories.find(
      (c) => c.name === "Smartphones"
    );
    if (smartphonesCategory) {
      thirdLevelCategories.push(
        { name: "iPhone", taxRate: 0.08, parent: smartphonesCategory },
        { name: "Android", taxRate: 0.08, parent: smartphonesCategory },
        {
          name: "Phone Accessories",
          taxRate: 0.08,
          parent: smartphonesCategory,
        }
      );
    }

    const laptopsCategory = savedSubCategories.find(
      (c) => c.name === "Laptops"
    );
    if (laptopsCategory) {
      thirdLevelCategories.push(
        { name: "Gaming Laptops", taxRate: 0.08, parent: laptopsCategory },
        { name: "Business Laptops", taxRate: 0.08, parent: laptopsCategory },
        { name: "Ultrabooks", taxRate: 0.08, parent: laptopsCategory }
      );
    }

    // Clothing third-level categories
    const mensClothingCategory = savedSubCategories.find(
      (c) => c.name === "Men's Clothing"
    );
    if (mensClothingCategory) {
      thirdLevelCategories.push(
        { name: "Casual Wear", taxRate: 0.06, parent: mensClothingCategory },
        { name: "Formal Wear", taxRate: 0.06, parent: mensClothingCategory },
        { name: "Sportswear", taxRate: 0.06, parent: mensClothingCategory }
      );
    }

    const womensClothingCategory = savedSubCategories.find(
      (c) => c.name === "Women's Clothing"
    );
    if (womensClothingCategory) {
      thirdLevelCategories.push(
        { name: "Dresses", taxRate: 0.06, parent: womensClothingCategory },
        { name: "Blouses", taxRate: 0.06, parent: womensClothingCategory },
        { name: "Activewear", taxRate: 0.06, parent: womensClothingCategory }
      );
    }

    // Home & Garden third-level categories
    const furnitureCategory = savedSubCategories.find(
      (c) => c.name === "Furniture"
    );
    if (furnitureCategory) {
      thirdLevelCategories.push(
        { name: "Living Room", taxRate: 0.07, parent: furnitureCategory },
        { name: "Bedroom", taxRate: 0.07, parent: furnitureCategory },
        { name: "Office", taxRate: 0.07, parent: furnitureCategory }
      );
    }

    // Sports third-level categories
    const fitnessCategory = savedSubCategories.find(
      (c) => c.name === "Fitness Equipment"
    );
    if (fitnessCategory) {
      thirdLevelCategories.push(
        { name: "Cardio Equipment", taxRate: 0.065, parent: fitnessCategory },
        { name: "Weight Training", taxRate: 0.065, parent: fitnessCategory },
        { name: "Yoga & Pilates", taxRate: 0.065, parent: fitnessCategory }
      );
    }

    const savedThirdLevelCategories = await this.categoryRepository.save(
      thirdLevelCategories
    );
    console.log(
      `Created ${savedThirdLevelCategories.length} third-level categories`
    );

    // Combine all categories for random assignment
    const allCategories = [
      ...savedParentCategories,
      ...savedSubCategories,
      ...savedThirdLevelCategories,
    ];

    // Then create products
    const products: Partial<Product>[] = [];
    const statuses = ["Active", "Discontinued", "Pending", "Pre-Order"];

    for (let i = 0; i < 10000; i++) {
      // Generate realistic pricing
      const price = faker.number.float({
        min: 10,
        max: 1000,
        fractionDigits: 2,
      });

      // Generate realistic quantities
      const quantity = faker.number.int({ min: 0, max: 5000 });

      // Generate realistic launch dates
      const launchDate = faker.date.between({
        from: "2019-01-01",
        to: new Date(),
      });

      // Generate product names
      const productName = faker.commerce.productName();

      // Assign random supplier and category
      const supplier = faker.helpers.arrayElement(savedSuppliers);
      const category = faker.helpers.arrayElement(allCategories);

      products.push({
        name: productName,
        price,
        quantity,
        launchDate,
        status: faker.helpers.arrayElement(statuses),
        isActive: faker.helpers.weightedArrayElement([
          { weight: 80, value: true },
          { weight: 20, value: false },
        ]),
        supplier,
        category,
      });
    }

    // Insert products in batches
    const batchSize = 500;
    const savedProducts = [];
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const saved = await this.productRepository.save(batch);
      savedProducts.push(...saved);
    }
    console.log(`Created ${savedProducts.length} products`);

    // Finally, create many-to-many relationships
    const productTags: Partial<ProductTag>[] = [];
    for (const product of savedProducts) {
      // Each product gets 0-4 random tags
      const numTags = faker.number.int({ min: 0, max: 4 });
      const selectedTags = faker.helpers.arrayElements(savedTags, numTags);

      for (const tag of selectedTags) {
        productTags.push({
          productId: product.id,
          tagId: tag.id,
        });
      }
    }

    // Insert product-tag relationships in batches
    for (let i = 0; i < productTags.length; i += batchSize) {
      const batch = productTags.slice(i, i + batchSize);
      await this.productTagRepository.save(batch);
    }

    console.log(`Created ${productTags.length} product-tag relationships`);
    console.log(
      `Seeding completed: ${savedProducts.length} products, ${savedTags.length} tags, ${productTags.length} relationships`
    );
  }
}
