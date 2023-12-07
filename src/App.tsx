import React from 'react';
import './App.css';
import { Autocomplete, Button, TextField } from '@mui/material';
import axios from 'axios';

function App() {
  const [tickerQuery, setTickerQuery] = React.useState<string | undefined>('');
  const [autocompleteValue, setAutocompleteValue] = React.useState<string | null>(null);
  const [selectedTickers, setSelectedTickers] = React.useState<{ ticker: string;  price: number}[]>([]);
  const [tickerSuggestion, setTickerSuggestion] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (tickerQuery) {
      axios.get(`https://us-west2-csci201-376723.cloudfunctions.net/stocks/v1/search?query=` + tickerQuery)
        .then(res => {
          setTickerSuggestion(res.data.tickers);
        })
    } else {
      setTickerSuggestion([]);
    }
  }, [tickerQuery]);

  const getTickerPrice = (ticker: string): Promise<number> => {
    return new Promise((resolve) => {
      axios.get(`https://us-west2-csci201-376723.cloudfunctions.net/stocks/v1/price?ticker=` + ticker).then((res) => resolve(res.data.price));
    })
  }

  const refreshPrice = async () => {
    const newSelectedTickers = [];
    for (const tickerObj of selectedTickers) {
      const newPrice = await getTickerPrice(tickerObj.ticker);
      newSelectedTickers.push({ticker: tickerObj.ticker, price: newPrice});
    }
    setSelectedTickers(newSelectedTickers);
  }

  return (
    <div className="App">
      <Autocomplete
        id="country-select-demo"
        value={autocompleteValue}
        onChange={(event: any, newValue: string | null) => {
          setAutocompleteValue(null);
          setTickerQuery('');
          if (newValue) { 
              getTickerPrice(newValue)
              .then(price => {
                setSelectedTickers([...selectedTickers, { ticker: newValue, price }]);
              })
          } 
        }}
        inputValue={tickerQuery}
        onInputChange={(event, newInputValue) => {
          setTickerQuery(newInputValue);
        }}
        filterOptions={(x) => x}
        options={tickerSuggestion}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search ticker"
            inputProps={{
              ...params.inputProps,
            }}
          />
      )}
      />
      {
        selectedTickers.length ? (
          <div style={{marginTop: '30px'}}>
            <Button onClick={refreshPrice} variant="contained">Refresh Price</Button>
            {
              selectedTickers.map(x => <div className='ticker-container'>{x.ticker}<span>({x.price})</span></div>)
            }
          </div>
        ) : null
      }
      
      
    </div>
  );
}

export default App;
