import { Component, OnInit, OnDestroy } from '@angular/core';
import { Currency } from '../../../app/models/currency';
import { ConverterService } from '../../../app/service/converter.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const currencyNames = require("src/config/currency");

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent implements OnInit, OnDestroy {
  // Store latest/today's currency rates
  rates: Currency[] = [];
  // Store currency watchlist
  watchList: Currency[] = [];
  converterRequest: Subscription;
  baseNumberSubscription: Subscription;
  base: number = 10;
  baseCurrency: string = "USD";

  constructor(
    private converterService: ConverterService
  ) {
    this.baseNumberSubscription = this.converterService.getUserInput()
    .pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((number: number) => {
      this.base = number;
      this.updateValues();
    });
  }

  ngOnInit() {
    this.converterRequest = this.converterService.getRates(this.baseCurrency)
    .subscribe((res) => {
      for (let rate in res["rates"]) {
        this.rates.push({
          id: rate,
          name: currencyNames[rate],
          rate: res["rates"][rate],
          value: res["rates"][rate] * this.base,
          watching: false
        });
      }
    });
  }

  ngOnDestroy() {
    // Remove subscription upon destroying component
    this.converterRequest.unsubscribe();
    this.baseNumberSubscription.unsubscribe();
  }

  private updateValues(): void {
    for (let curr in this.rates) {
      this.rates[curr]["value"] = this.rates[curr]["rate"] * this.base;
    }
  }

  addToWatchList(index: number): void {
    this.rates[index].watching = true;
    this.watchList.push(this.rates[index]);
  }

  removeFromWatchList(id: string): void {
    this.watchList = this.watchList.filter((element) => {
      return element.id != id
    });

    let rateIndex = this.rates.findIndex((e) => {
      return e.id == id;
    });

    this.rates[rateIndex].watching = false;
  }
}
