import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);
  
  console.log('Starting data seeding...');
  await productsService.seedData();
  console.log('Data seeding completed!');
  
  await app.close();
}

seed().catch(console.error);
