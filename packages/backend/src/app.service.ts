import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  /**
   * function to get information about a ban. Can be useful for internal tooling
   * 
   * @param ip IP address of the request
   * @returns 
   */
  async getReason(ip: string): Promise<any> {
    // since we only have ipv4 atm, we can safely just take the last part. This needs to be changed when we roll out ipv6.
    const _ip = ip.split(/[:]/).pop();
    // query LAPI for information about the ban
    return this.httpService
      .get('/v1/decisions?ip=' + _ip + '&contains=true', {
        headers: {
          'X-Api-Key': this.configService.get("LAPI_KEY"),
        },
        baseURL: this.configService.get("LAPI_HOST")
      })
      .pipe(map((response) => response.data));
  }

  /**
   * function to unban the requesters IP at the LAPI
   * 
   * @param ip ip of the request
   * @returns 
   */
  async unbanMe(ip: string): Promise<any> {
    // get IP
    const _ip = ip.split(/[:]/).pop();

    return this.httpService
      .get('/v1/decisions?ip=' + _ip + '&contains=true', {
        headers: {
          'X-Api-Key': this.configService.get("LAPI_KEY"),
        },
        baseURL: this.configService.get("LAPI_HOST")
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
      )
      .pipe(
        map(async (data) => {
          if (Array.isArray(data) && data.length > 0) {
            // get ID of the decision-list entry
            const id = data[0].id;
            
            // login with maschine credentials
            const login = await this.httpService
              .post('/v1/watchers/login', {
                // maschine ID
                machine_id: this.configService.get("MASCHINE_ID"),
                // maschine password
                password:
                  this.configService.get("MASCHINE_PASSWORD"),

              }, {
                // URL of the LAPI
                baseURL: this.configService.get("LAPI_HOST")
              }
              )
              .toPromise();
            // get the authentication token
            const token = login.data.token;
            // post delete request to remove entry.
            const res = await this.httpService
              .delete('/v1/decisions/' + id, {
                headers: {
                  Authorization: 'Bearer ' + token,
                },
                baseURL: this.configService.get("LAPI_HOST")
              })
              .toPromise();
          }
        }),
      );
  }
}
