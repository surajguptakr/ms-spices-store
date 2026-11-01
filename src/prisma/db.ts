import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

const contract = contractFromJson<Contract>(contractJson);
const createPrisma = () =>
  postgres({ contract, url: process.env.DATABASE_URL! });
type PrismaDatabase = ReturnType<typeof createPrisma>;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaDatabase;
};

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
