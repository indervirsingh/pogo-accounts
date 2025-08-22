import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { PogoAccounts } from '../pogo-accounts'
import { PogoAccountsService } from '../pogo-accounts.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'


@Component({
  selector: 'app-pogo-accounts-list',
  template: `
    <h2 class="text-center m-5">Accounts List</h2>
    
    <table class="table table-striped table-bordered">
      <thead class="thead-dark">
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Team</th>
          <th>Country</th>
          <th>Birthday</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let pogoAccount of pogoAccounts$ | async">
          <td [textContent]="pogoAccount.username"></td>
          <td [textContent]="pogoAccount.email"></td>
          <td [textContent]="pogoAccount.team"></td>
          <td [textContent]="pogoAccount.country"></td>
          <td [textContent]="pogoAccount.birthday"></td>
          <td>
            <button class="btn btn-primary me-1" [routerLink]="['edit', pogoAccount._id]">Edit</button>
            <button class="btn btn-danger" (click)="deletePogoAccount(pogoAccount._id || '')">Delete</button>
          </td>  
        </tr>
      </tbody>
    </table>

    <button class="btn btn-primary mt-3" [routerLink]="['add']">Add a New Account</button>

  `,
  styles: [
  ]
})

export class PogoAccountsListComponent implements OnInit {
  public pogoAccounts$: Observable<PogoAccounts[]> = new Observable()

  constructor(
    private pogoAccountsService: PogoAccountsService,
    private sanitizer: DomSanitizer
  ) {  }

  ngOnInit(): void {
    this.fetchPogoAccounts()
  }

  deletePogoAccount(id: string) {
    // Validate ID format before making request
    if (!id || typeof id !== 'string' || id.length !== 24) {
      console.error('Invalid account ID format');
      return;
    }
    
    if (confirm('Are you sure you want to delete this account?')) {
      this.pogoAccountsService.deletePogoAccount(id).subscribe({
        next: () => this.fetchPogoAccounts(),
        error: (err) => {
          console.error('Failed to delete account:', err);
          alert('Failed to delete account. Please try again.');
        }
      })
    }
  }

  private fetchPogoAccounts(): void {
    this.pogoAccounts$ = this.pogoAccountsService.getPogoAccounts()
  }

}
