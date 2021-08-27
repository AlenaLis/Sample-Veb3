import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import {TextField} from '@material-ui/core';
import {TODO_LIST_ABI, TODO_LIST_ADDRESS} from '../config';

import './ToDo.scss';

const ToDo = () => {

  const [item, setItem] = useState({
    tasks: [],
    taskCount: 0,
    account: '',
    loading: true
  });

  useEffect(async() => {
    await loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    setItem((prev)=>({...prev, account: accounts[0]}))
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
    setItem((prev) => ({...prev, todoList}))
    const taskCount = await todoList.methods.taskCount().call()
    setItem((prev) => ({...prev, taskCount}))
    for (let i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call()
      setItem((prev) =>({...prev, tasks: [...item.tasks, task]}))
    }
    setItem((prev) => ({...prev, loading: false}))
  }

  const handleChange = (e, key) => {
    if (key === 'tasks') {
      const {value} = e.target
      setItem((prevState) => ({
        ...prevState,
        [key]: value,
      }))
    }
  }

  const createTask = (e) => {
    item.todoList.methods.createTask(e).send({from: item.account})
      .once('receipt', (receipt) => {
        setItem((prev) => ({...prev, loading: false}))
      })
  }

  return (
    <div className='wrapper' id="content">
      <div className='container'>
        <h1>
          TO DO LIST
        </h1>
        <form onSubmit={(event) => {
          event.preventDefault()
          createTask(item.tasks)
        }}>
          <TextField
            onChange={(e) => handleChange(e, 'tasks')}
            id="newTask"
            className='input'
            label="Please, enter new task here"
            type="text"
          />
          <input type="submit" hidden={true}/>
        </form>
        {/*<ul>*/}
        {/*  {item?.map((e) => {*/}
        {/*    return(*/}
        {/*      <div key={e.key}>*/}
        {/*        <label>*/}
        {/*          <span>{e.tasks.content}</span>*/}
        {/*        </label>*/}
        {/*      </div>*/}
        {/*    )*/}
        {/*  })}*/}
        {/*</ul>*/}
      </div>
    </div>
  )
}

export default ToDo
