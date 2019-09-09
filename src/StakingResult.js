import React, { useState } from 'react'
import { getStake, getDelegation, getPRep, queryIScore } from './iiss';
import { IconAmount, IconConverter } from 'icon-sdk-js'
import IconService, { HttpProvider } from 'icon-sdk-js'

const StakingResult = ({ match }) => {
    const address = 'hx' + match.params.address

    const [stakeAmount, setStakeAmount] = useState(0)
    const [unstakeAmount, setUnstakeAmount] = useState(null)
    const [unstakeBlockHeight, setUnstakeBlockHeight] = useState(null)
    const [unstakeTimeRemaining, setUnstakeTimeRemaining] = useState(null)
    const [blockHeight, setBlockHeight] = useState(null)
    const [totalDelegated, setTotalDelegated] = useState(0)
    const [votingPower, setVotingPower] = useState(0)
    const [preps, setPreps] = useState(null)
    const [delegations, setDelegations] = useState(null)
    const [ready, setReady] = useState(null)
    const [iscoreICX, setIscoreICX] = useState(null)
    const [iscoreBlockHeight, setIscoreBlockHeight] = useState(null)
    const [iscoreTimeDiff, setIscoreTimeDiff] = useState(null)

    const loop2icx = (loop) => {
        return IconConverter.toNumber(IconAmount.of(loop, IconAmount.Unit.LOOP).convertUnit(IconAmount.Unit.ICX))
    }

    const getInformation = () => {

        setPreps(null)
        setDelegations(null)

        const httpProvider = new HttpProvider('https://ctz.solidwallet.io/api/v3')
        const iconService = new IconService(httpProvider)

        getStake(address).then(async result => {
            if (result['stake']) {
                setStakeAmount(loop2icx(result['stake']))
            }
            if (result['unstake']) {
                setUnstakeAmount(loop2icx(result['unstake']))
            }
            if (result['unstakeBlockHeight']) {
                const latest = await iconService.getBlock("latest").execute();
                const targetBH = parseInt(result['unstakeBlockHeight'], 16)
                const diffBlocks = targetBH - latest['height']
                const diffSeconds = diffBlocks * 2
                const diffHours = (diffSeconds / 3600.0).toFixed(2)
                setUnstakeBlockHeight(targetBH)
                setUnstakeTimeRemaining(diffHours)
            }
            if (result['blockHeight']) {
                const bh = parseInt(result['blockHeight'], 16)
                setBlockHeight(bh)
            }
        })

        getDelegation(address).then(result => {
            setTotalDelegated(loop2icx(result['totalDelegated']))
            setVotingPower(loop2icx(result['votingPower']))
            setDelegations(result['delegations'])
            const promises = result['delegations'].map(element => {
                return getPRep(element['address'])
            });
            Promise.all(promises).then(result => {
                setPreps(result)
            })
        })

        queryIScore(address).then(async result => {
            const latest = await iconService.getBlock("latest").execute();
            const targetBH = parseInt(result['blockHeight'], 16)
            setIscoreICX(loop2icx(result['estimatedICX']))
            setIscoreBlockHeight(targetBH)
            const diffBlocks = latest['height'] - targetBH
            const diffSeconds = diffBlocks * 2
            const diffHours = (diffSeconds / 3600.0).toFixed(2)
            setIscoreTimeDiff(diffHours)
        })

        return true
    }

    ready !== address && address.length === 42 && getInformation() && setReady(address)

    return (
        <>
            {address.length !== 42 ?
                <div className="title">This address is invalid.</div>
                :
                <>
                    {stakeAmount === 0 ?
                        <div className="title">This address hasn't staked any ICX.</div>
                        :
                        <>
                            <br />
                            <div className="title">Staking Information</div>
                            <br />
                            <table className="table">
                                <thead>
                                    <tr className="dark">
                                        {stakeAmount && <td>Stake Amount</td>}
                                        {unstakeAmount && <td>Unstake Amount</td>}
                                        {blockHeight && <td>Stake Block Height</td>}
                                        {unstakeBlockHeight && <td>Unstake Block Height</td>}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {stakeAmount && <td>{stakeAmount} ICX</td>}
                                        {unstakeAmount && <td>{unstakeAmount} ICX</td>}
                                        {unstakeBlockHeight && <td>{unstakeBlockHeight} ({unstakeTimeRemaining} hours or {(unstakeTimeRemaining / 24).toFixed(2)} days)</td>}
                                        {blockHeight && <td>{blockHeight}</td>}
                                    </tr>
                                </tbody>
                            </table>

                            {preps && delegations && preps.length !== 0 && delegations.length !== 0 &&
                                <>
                                    <div className="title">Voting Information</div>
                                    <br />
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <td className="dark">Total delegated</td>
                                                <td className="dark">Voting Power</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{totalDelegated} ICX</td>
                                                <td>{votingPower} ICX</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="title">P-Reps Delegation Information</div>
                                    <table className="table">
                                        <thead>

                                            <tr>
                                                <td className="dark">P-Rep Name</td>
                                                <td className="dark">Delegation amount (ICX)</td>
                                            </tr>

                                        </thead>
                                        <tbody>
                                            {delegations.map(delegate => (
                                                <tr key={delegate.address}>
                                                    <td>
                                                        {preps.filter(prep => prep.address === delegate.address)[0].name}
                                                    </td>
                                                    <td>
                                                        {loop2icx(delegate.value, IconAmount.Unit.LOOP)} ICX
                                                    </td>
                                                </tr>

                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            }

                            {iscoreICX !== null &&
                                <>
                                    <div className="title">Reward Information</div>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <td className="dark">I-Score available for claiming (ICX)</td>
                                                <td className="dark">Block height when I-Score was estimated</td>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr>
                                                <td>{iscoreICX} ICX</td>
                                                <td>
                                                    <a rel="noopener noreferrer" target="_blank" href={"https://tracker.icon.foundation/block/" + iscoreBlockHeight}>
                                                        {iscoreBlockHeight}
                                                    </a> ({iscoreTimeDiff} hours ago or {(iscoreTimeDiff / 24).toFixed(2)} days)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </>
                            }
                        </>
                    }
                </>
            }
        </>
    )
}

export default StakingResult