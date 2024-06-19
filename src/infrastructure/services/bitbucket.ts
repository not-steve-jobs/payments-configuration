import { FaultTolerantRequestApi } from '@internal/request-library';

interface BitbucketSdkOptions {
  workspace: string;
  accessToken: string;
  projectName: string;
  faultTolerantRequestApi: FaultTolerantRequestApi;
}

export interface RepositoryTag {
  name: string;
  target: {
    date: string;
  };
}

export interface RepositoryTagsPage {
  values: RepositoryTag[];
  next: string;
}

export class BitbucketSdk {
  private static readonly BASE_API_PATH = 'https://api.bitbucket.org/2.0/repositories';
  private static readonly TAGS_PAGE_SIZE = '100';

  private readonly workspace: string;
  private readonly accessToken: string;
  private readonly projectName: string;
  private readonly requestApi: FaultTolerantRequestApi;
  constructor(options: BitbucketSdkOptions) {
    this.workspace = options.workspace;
    this.accessToken = options.accessToken;
    this.projectName = options.projectName;
    this.requestApi = options.faultTolerantRequestApi;
  }

  public async getRepositoryTags(): Promise<RepositoryTag[]> {
    const tags: RepositoryTag[] = [];
    const params = new URLSearchParams({
      sort: '-target.date',
      fields: 'values.name,values.target.date,next',
      pagelen: BitbucketSdk.TAGS_PAGE_SIZE,
    });

    let targetUrl = `${BitbucketSdk.BASE_API_PATH}/${this.workspace}/${this.projectName}/refs/tags/?${params.toString()}`;
    do {
      const response = await this.requestApi.get<RepositoryTagsPage>(targetUrl, null, null, {
        Authorization: `Bearer ${this.accessToken}`,
      });

      tags.push(...response.values);
      targetUrl = response.next;
    } while (targetUrl);

    return tags;
  }
}
