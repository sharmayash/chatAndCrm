import PropTypes from "prop-types"
import { connect } from "react-redux"
import React, { useEffect, useState, useRef } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { deepPurple } from "@material-ui/core/colors"
import SendRounded from "@material-ui/icons/SendRounded"
import { newMsg } from "../../../../redux/actions/chatActions"

import VideoCallTwoTone from "@material-ui/icons/VideoCallTwoTone"

import {
  Grid,
  Paper,
  Tooltip,
  TextField,
  IconButton,
  Typography,
} from "@material-ui/core"

import CloseIcon from "@material-ui/icons/Close"

import { Slide, Button, Dialog, AppBar, Toolbar } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  root: {
    height: "83vh",
    "&::-webkit-scrollbar": {
      appearance: "none",
      height: 0,
    },
  },
  chatBox: {
    height: "70vh",
    overflow: "auto",
    "&::-webkit-scrollbar": {
      appearance: "none",
      height: 0,
    },
  },
  bubbleContainer: {
    width: "100%",
    display: "flex",
    //check style.css for left and right classnaeme based on your data
  },
  bubble: {
    margin: "5px",
    padding: "10px",
    maxWidth: "40ch",
    display: "inline-block",
    borderRadius: "10px",
  },
  appBar: {
    position: "relative",
    backgroundColor: "transparent",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}))

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function MessageBox(props) {
  const classes = useStyles()
  const [msgValue, setMsgValue] = useState("")
  const { socket, newMsg, chat } = props
  const { currentRoom } = chat

  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [chat.chats])

  useEffect(() => {
    if (socket) {
      socket.on("newMsg", (data) => {
        newMsg(currentRoom, data)
      })
      return () => {
        socket.off("newMsg")
      }
    }
  }, [socket, currentRoom, newMsg])

  const handleChange = (e) => {
    setMsgValue(e.target.value)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!msgValue) {
      return
    }

    var today = new Date()
    var date = `${today.getMonth() + 1}/${today.getDate()}`
    var time = `${today.getHours()}:${today.getMinutes()}`
    var dateTime = `⏲ ${time} 📆 ${date}`
    var msgEL = {
      text: msgValue,
      timestamp: dateTime,
      userId: props.auth.user.id,
      username: props.auth.user.username,
      roomName: props.chat.currentRoom,
    }

    socket.emit("sendMsg", msgEL)
    setMsgValue("")
  }

  let chatBubbles

  if (chat.currentRoom === "") {
    chatBubbles = <h5>Select A Chat Room</h5>
  } else if (chat.chats.length === 0) {
    chatBubbles = <h5>No Chats in this Room</h5>
  } else if (chat.chats.length > 0) {
    chatBubbles = chat.chats.map((chat, i) =>
      chat.sender.username === props.auth.user.username ? (
        <div key={i} className={`${classes.bubbleContainer} right`}>
          <Paper
            className={classes.bubble}
            elevation={3}
            style={{ backgroundColor: "#dcedc8" }}
          >
            <Typography>{chat.message}</Typography>
          </Paper>
        </div>
      ) : (
        <div key={i} className={`${classes.bubbleContainer} left`}>
          <Paper
            className={classes.bubble}
            elevation={3}
            style={{ backgroundColor: deepPurple[200] }}
          >
            <Typography>{chat.message}</Typography>
          </Paper>
        </div>
      )
    )
  }
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        direction="column"
        justify="flex-end"
        alignItems="stretch"
        spacing={2}
      >
        {currentRoom ? (
          <Grid item container direction="row">
            <Grid item xs style={{ flexGrow: 1 }}>
              <Typography variant="subtitle2">{currentRoom}</Typography>
            </Grid>
            <Tooltip title="Video Chat">
              <IconButton color="inherit" onClick={handleClickOpen}>
                <VideoCallTwoTone />
              </IconButton>
            </Tooltip>
          </Grid>
        ) : null}
        <Grid item className={classes.chatBox}>
          {chatBubbles}
          <div ref={messagesEndRef} />
        </Grid>
        <Grid item>
          <form onSubmit={sendMessage}>
            <Grid container direction="row" justify="center">
              <Grid item style={{ flexGrow: 1 }}>
                <TextField
                  required
                  margin="dense"
                  name="aMsg"
                  value={msgValue}
                  onChange={handleChange}
                  label="Type your Message Here"
                  type="text"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <IconButton type="submit">
                  <SendRounded />
                </IconButton>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
      <Dialog
        fullScreen
        open={open}
        PaperProps={{
          style: {
            opacity: "0.8",
            backgroundColor: "black",
            color: "white",
            boxShadow: "none",
          },
        }}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar elevation={0} className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Video Chat
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <h1>Video Chat</h1>
      </Dialog>
    </div>
  )
}

MessageBox.propTypes = {
  auth: PropTypes.object.isRequired,
  chat: PropTypes.object.isRequired,
  newMsg: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  chat: state.chat,
})

export default connect(mapStateToProps, { newMsg })(MessageBox)
