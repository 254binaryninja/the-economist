import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IEconomicNewsFeedRepository,
  NewsFetchParams,
} from "../domain/repository/IEconomicNewsFeedRepository";

@injectable()
export class EconomicNewsFeedController {
  constructor(
    @inject(TYPES.IEconomicsNewsFeedRepository)
    private economicNewsFeedRepository: IEconomicNewsFeedRepository,
  ) {}

  async fetchNews(params?: NewsFetchParams) {
    return this.economicNewsFeedRepository.fetchNews(params);
  }
}
