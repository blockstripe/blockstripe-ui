import React, { useState, useCallback, useEffect } from 'react';
import { Button, Container, Typography, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { providers } from 'near-api-js';

import ApiService from '../../services/ApiService';
import IncrementControl from '../common/IncrementControl';

const config = {
    month: {
        max: 12,
    },
    date: {
        max: 31,
    },
};

const ExecutableConfigurator = ({ handleTenantExecutableCreation, accountId }) => {
    const [executableDate, setExecutableDate] = useState({
        month: 1,
        date: 1,
    });
    const [executablePeriod, setExecutablePeriod] = useState('month');
    const [receiverData, setReceiverData] = useState({
        amount: null,
        receiverEmail: null,
        receiverAccountId: null,
        executeUntilDate: null,
    });

    const handleChangeReceiverField = useCallback((e, name) => {
        setReceiverData(prev => ({
            ...prev,
            [name]: e.target.value,
        }));
    }, []);

    const handleChangeUntilDate = useCallback((e) => {
        setReceiverData(prev => ({
            ...prev,
            executeUntilDate: e.toDate(),
        }));
    }, []);

    const handleScheduleExecutable = useCallback(() => {
        const untilDate = receiverData.executeUntilDate;
        const amount = parseFloat(receiverData.amount);
        let counts = 0;

        if (executablePeriod === 'month') {
            let untilDateAhead = true;
            let currentDate = dayjs();
            currentDate.set('date', executableDate[executablePeriod]);

            while (untilDateAhead) {
                currentDate = currentDate.add(1, 'month');

                if (currentDate > untilDate) {
                    untilDateAhead = false;
                } else {
                    counts++;
                }
            }
        } else {
            let untilDateAhead = true;
            let currentDate = dayjs();
            currentDate.set('month', executableDate[executablePeriod]);
            counts = 1;

            while (untilDateAhead) {
                currentDate = currentDate.add(1, 'year');

                if (currentDate > untilDate) {
                    untilDateAhead = false;
                } else {
                    counts++;
                }
            }
        }

        if (counts > 0) {
            localStorage.setItem('lastTenantExecutableAddTxPayload', JSON.stringify({
                executableDate,
                executablePeriod,
            }));

            handleTenantExecutableCreation({
                amount,
                counts,
                receiverAccountId: receiverData.receiverAccountId,
                receiverEmail: receiverData.receiverEmail,
            });
        }
    }, [receiverData, executableDate, executablePeriod]);

    const handleToggleIncrement = useCallback((direction, name) => {
        const executableConfig = config[name];

        if (
            (direction === '+' && (executableDate[name] + 1) > executableConfig.max) ||
            (direction === '-' && executableDate[name] === 1)
        ) {
            return;
        }

        setExecutableDate(prev => ({
            ...prev,
            [name]: direction === '+' ? prev[name] + 1 : prev[name] - 1,
        }));
    }, [executableDate]);

    const handleSetPeriod = useCallback((newPeriod) => {
        setExecutablePeriod(newPeriod);
    }, []);

    const _buildConfigurationForm = () => {
        return (
            <div className="executable-configurator-form">
                <p>Period of execution
                    {'\n'}<span
                        onClick={() => handleSetPeriod('month')}
                        className={executablePeriod === 'month' ? 'text-selectable text-selected' : ''}>month
                    </span>
                    {'\n'}<span
                        onClick={() => handleSetPeriod('year')}
                        className={executablePeriod === 'year' ? 'text-selectable text-selected' : ''}>year
                    </span>
                </p>
                {executablePeriod === 'year' ? (<div>Execute payment at
                    <IncrementControl handleToggleIncrement={handleToggleIncrement} value={executableDate.month} name="month" />
                month</div>) : (<div>
                    Execute payment at
                    <IncrementControl handleToggleIncrement={handleToggleIncrement} value={executableDate.date} name="date" />
                day
                </div>)}
                <Container style={{ marginTop: 20 }}>
                    <TextField style={{ margin: 5 }} placeholder="Receiver email" onChange={e => handleChangeReceiverField(e, 'receiverEmail')} />
                    <TextField style={{ margin: 5 }} placeholder="Receiver account" onChange={e => handleChangeReceiverField(e, 'receiverAccountId')} />
                    <TextField style={{ margin: 5 }} placeholder="Amount in NEAR" onChange={e => handleChangeReceiverField(e, 'amount')} type="number" />
                </Container>
                <Container>
                    <div style={{ margin: 5 }}>
                        <DatePicker label="Execute until date" onChange={e => handleChangeUntilDate(e)} />
                    </div>
                </Container>
            </div>
        );
    };

    // Temporary solution due to luck of time.
    /* const handleAfterTxSent = useCallback(async () => {
        const provider = new providers.JsonRpcProvider('https://archival-rpc.testnet.near.org');
        const params = new URLSearchParams(document.location.search);
        const txHash = params.get('transactionHashes');

        if (!!txHash && accountId) {
            const lastTenantExecutableId = await provider.txStatus(txHash, accountId);
            const lastTxPayload = localStorage.getItem('lastTenantExecutableAddTxPayload');

            if (!!lastTxPayload) {
                ApiService.scheduleTenantExecution(lastTxPayload.executablePeriod, lastTxPayload.executableDate, lastTenantExecutableId);
            }
        }
    }, [accountId]);

    useEffect(() => handleAfterTxSent(), []); */
     
    return (
        <Container className="text-align-center">
            <Typography variant="h2">Schedule new reccuring payment</Typography>
            <br />
            <form className="mr-top-20">
                {_buildConfigurationForm()}
            </form>
            <br />
            <Button
                onClick={handleScheduleExecutable}
                variant="contained"
                disabled={!Object.keys(receiverData).every(k => !!receiverData[k])}>
            Schedule</Button>
        </Container>
    );
};

export default ExecutableConfigurator;
