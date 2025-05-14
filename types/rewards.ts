import type { Database } from "./supabase"
import type { Customer } from "./customers"
import type { MembershipIncludedService } from "./membership"

export type RewardsProgram = Database["public"]["Tables"]["rewards_programs"]["Row"]
export type NewRewardsProgram = Database["public"]["Tables"]["rewards_programs"]["Insert"]
export type UpdateRewardsProgram = Database["public"]["Tables"]["rewards_programs"]["Update"]

export type RewardsEarningRule = Database["public"]["Tables"]["rewards_earning_rules"]["Row"]
export type NewRewardsEarningRule = Database["public"]["Tables"]["rewards_earning_rules"]["Insert"]
export type UpdateRewardsEarningRule = Database["public"]["Tables"]["rewards_earning_rules"]["Update"]

export type RewardsCatalogItem = Database["public"]["Tables"]["rewards_catalog"]["Row"]
export type NewRewardsCatalogItem = Database["public"]["Tables"]["rewards_catalog"]["Insert"]
export type UpdateRewardsCatalogItem = Database["public"]["Tables"]["rewards_catalog"]["Update"]

export type CustomerRewardsAccount = Database["public"]["Tables"]["customer_rewards_accounts"]["Row"]
export type NewCustomerRewardsAccount = Database["public"]["Tables"]["customer_rewards_accounts"]["Insert"]
export type UpdateCustomerRewardsAccount = Database["public"]["Tables"]["customer_rewards_accounts"]["Update"]

export type RewardsTransaction = Database["public"]["Tables"]["rewards_transactions"]["Row"]
export type NewRewardsTransaction = Database["public"]["Tables"]["rewards_transactions"]["Insert"]

export type RewardsRedemption = Database["public"]["Tables"]["rewards_redemptions"]["Row"]
export type NewRewardsRedemption = Database["public"]["Tables"]["rewards_redemptions"]["Insert"]
export type UpdateRewardsRedemption = Database["public"]["Tables"]["rewards_redemptions"]["Update"]

export type RuleType = "spend" | "service" | "referral" | "signup" | "custom"
export type UnitType = "dollar" | "service" | "referral" | "one-time" | "custom"
export type RewardType = "discount" | "free_service" | "merchandise" | "custom"
export type TransactionType = "earn" | "redeem" | "expire" | "adjust"
export type SourceType = "invoice" | "service" | "referral" | "reward" | "manual" | "custom"
export type RedemptionStatus = "pending" | "fulfilled" | "cancelled"
export type AccountStatus = "active" | "inactive" | "suspended"

export interface MerchandiseDetails {
  name: string
  description?: string
  sku?: string
  image_url?: string
  shipping_details?: {
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }
}

export interface RewardsCatalogItemWithDetails extends RewardsCatalogItem {
  service?: MembershipIncludedService
  merchandiseDetails?: MerchandiseDetails
}

export interface CustomerRewardsAccountWithDetails extends CustomerRewardsAccount {
  customer?: Customer
  program?: RewardsProgram
  transactions?: RewardsTransaction[]
  redemptions?: (RewardsRedemption & { reward: RewardsCatalogItem })[]
}

export interface RewardsTransactionWithDetails extends RewardsTransaction {
  account?: CustomerRewardsAccount
  redemption?: RewardsRedemption & { reward: RewardsCatalogItem }
}
