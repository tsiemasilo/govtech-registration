import { User, InsertUser, Registration, InsertRegistration } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getRegistration(id: number): Promise<Registration | undefined>;
  getAllRegistrations(): Promise<Registration[]>;
  verifyRegistrationCode(code: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private registrations: Map<number, Registration>;
  private currentUserId: number;
  private currentRegistrationId: number;
  private validRegistrationCodes: Set<string>;

  constructor() {
    this.users = new Map();
    this.registrations = new Map();
    this.currentUserId = 1;
    this.currentRegistrationId = 1;
    this.validRegistrationCodes = new Set([
      "GOVTEC2025",
      "COMP001",
      "REG123",
      "EVENT2025"
    ]);
    
    console.log("🗄️ Memory storage initialized");
    console.log(`📋 Valid registration codes: ${Array.from(this.validRegistrationCodes).join(", ")}`);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    console.log(`👤 Created user: ${user.username} (ID: ${id})`);
    return user;
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.currentRegistrationId++;
    const registration: Registration = {
      ...insertRegistration,
      id,
      createdAt: new Date(),
      company: insertRegistration.company || null,
      jobTitle: insertRegistration.jobTitle || null,
      marketingConsent: insertRegistration.marketingConsent || false,
      communicationMethod: insertRegistration.communicationMethod || "email",
      registrationCode: insertRegistration.registrationCode || null,
    };
    
    this.registrations.set(id, registration);
    
    const formattedId = `GOV-${id.toString().padStart(6, '0')}`;
    console.log(`📝 Created registration: ${formattedId} for ${registration.firstName} ${registration.lastName}`);
    
    return { ...registration, formattedId } as Registration & { formattedId: string };
  }

  async getRegistration(id: number): Promise<Registration | undefined> {
    return this.registrations.get(id);
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async verifyRegistrationCode(code: string): Promise<boolean> {
    const isValid = this.validRegistrationCodes.has(code);
    console.log(`🔍 Verifying code "${code}": ${isValid ? "✅ Valid" : "❌ Invalid"}`);
    return isValid;
  }
}

export const storage = new MemStorage();