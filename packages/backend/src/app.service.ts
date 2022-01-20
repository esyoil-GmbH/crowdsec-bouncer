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

  async getReason(ip: string): Promise<any> {
    console.log(ip);

    // since we only have ipv4 atm, we can safely just take the last part. This needs to be changed when we roll out ipv6.
    const _ip = ip.split(/[:]/).pop();
    // return _ip;
    return this.httpService
      .get('/v1/decisions?ip=' + _ip + '&contains=true', {
        headers: {
          'X-Api-Key': this.configService.get("LAPI_KEY"),
        },
        baseURL: this.configService.get("LAPI_HOST")
      })
      .pipe(map((response) => response.data));
  }

  async unbanMe(ip: string): Promise<any> {
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
            const id = data[0].id;

            const login = await this.httpService
              .post('/v1/watchers/login', {
                machine_id: this.configService.get("MASCHINE_ID"),
                password:
                  this.configService.get("MASCHINE_PASSWORD"),

              }, {
                baseURL: this.configService.get("LAPI_HOST")
              }
              )
              .toPromise();
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
