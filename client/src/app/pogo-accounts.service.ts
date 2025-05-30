import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, Subject, tap } from 'rxjs'
import { PogoAccounts } from './pogo-accounts'


@Injectable({
  providedIn: 'root'
})
export class PogoAccountsService {

  private pogoAccountsUrl = 'http://localhost:5200'
  private pogoAccounts$: Subject<PogoAccounts[]> = new Subject()


  constructor(private httpClient: HttpClient) { }

  private refreshPogoAccounts() {
    this.httpClient.get<PogoAccounts[]>(`${this.pogoAccountsUrl}/pogo-accounts`)
      .subscribe(pogoAccounts => {
        this.pogoAccounts$.next(pogoAccounts)
      })
  }

  public getPogoAccounts(): Subject<PogoAccounts[]> {
    this.refreshPogoAccounts()
    return this.pogoAccounts$
  }

  public getPogoAccount(id: string): Observable<PogoAccounts> {
    return this.httpClient.get<PogoAccounts>(`${this.pogoAccountsUrl}/pogo-accounts/${id}`)
  }

  public createPogoAccount(pogoAccount: PogoAccounts): Observable<string> {
    return this.httpClient.post(`${this.pogoAccountsUrl}/pogo-accounts`, pogoAccount, { responseType: 'text' })
  }

  public updatePogoAccount(id: string, pogoAccount: PogoAccounts): Observable<string> {
    return this.httpClient.put(`${this.pogoAccountsUrl}/pogo-accounts/${id}`, pogoAccount, { responseType: 'text' })
  }

  public deletePogoAccount(id: string): Observable<string> {
    return this.httpClient.delete(`${this.pogoAccountsUrl}/pogo-accounts/${id}`, { responseType: 'text' })
  }
}
