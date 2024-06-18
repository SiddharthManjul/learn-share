local sqlite3 = require('lsqlite3')
db = db or sqlite3.open_memory()
dbAdmin = require('@rakis/DbAdmin').new(db)

-- Database schema
AUTHORS = [[
  CREATE TABLE IF NOT EXISTS Authors (
    PID TEXT PRIMARY KEY,
    Name TEXT UNIQUE
  );
]]

POSTS = [[
  CREATE TABLE IF NOT EXISTS Posts (
    ID TEXT PRIMARY KEY,
    PID TEXT,
    Title TEXT,
    Body TEXT,
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PID) REFERENCES Authors(PID)
  );
]]

LIKES = [[
  CREATE TABLE IF NOT EXISTS Likes (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT,
    user_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts(ID)
  );
]]

CHATROOMS = [[
  CREATE TABLE IF NOT EXISTS Chatrooms (
    post_id TEXT,
    user_id TEXT,
    PRIMARY KEY (post_id, user_id)
  );
]]

MESSAGES = [[
  CREATE TABLE IF NOT EXISTS Messages (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT,
    user_id TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts(ID)
  );
]]

-- Initialize database
function InitDb()
    db:exec(AUTHORS)
    db:exec(POSTS)
    db:exec(LIKES)
    db:exec(CHATROOMS)
    db:exec(MESSAGES)
    return dbAdmin:tables()
end

InitDb()

-- User Handlers
Handlers.add("LearnShare.RegisterUser",
    function(msg)
        return msg.Action == "RegisterUser"
    end,
    function(msg)
        -- Check if the PID is already registered
        local authorCount = #dbAdmin:exec(string.format([[SELECT * FROM Authors WHERE PID = "%s";]], msg.From))
        if authorCount > 0 then
            Send({ Target = msg.From, Action = "Registered", Data = "Already Registered" })
            print("Author already registered")
            return "Already Registered"
        end

        -- Check if the username is already taken
        local usernameCount = #dbAdmin:exec(string.format([[SELECT * FROM Authors WHERE Name = "%s";]], msg.Name))
        if usernameCount > 0 then
            Send({ Target = msg.From, Action = "Registered", Data = "Username Taken" })
            print("Username taken")
            return "Username Taken"
        end

        local Name = msg.Name or 'anon'
        dbAdmin:exec(string.format([[INSERT INTO Authors (PID, Name) VALUES ("%s", "%s");]], msg.From, Name))
        Send({ Target = msg.From, Action = "LearnShare.Registered", Data = "Successfully Registered." })
        print("Registered " .. Name)
    end
)

-- Post Handlers
Handlers.add("LearnShare.CreatePost",
    function(msg)
        return msg.Action == "CreatePost"
    end,
    function(msg)
        local author = dbAdmin:exec(string.format([[SELECT PID, Name FROM Authors WHERE PID = "%s";]], msg.From))[1]
        if author then
            dbAdmin:exec(string.format(
                [[INSERT INTO Posts (ID, PID, Title, Body, Description) VALUES ("%s", "%s", "%s", "%s", "%s");]],
                msg.Id, author.PID, msg.Title, msg.Data, msg.Description))
            Send({ Target = msg.From, Data = "Article Posted." })
            print("New Article Posted")
            return "ok"
        else
            Send({ Target = msg.From, Data = "Not Registered" })
            print("Author not registered, can't post")
        end
    end
)

Handlers.add("LearnShare.GetPosts",
    function(msg)
        return msg.Action == "GetPosts"
    end,
    function(msg)
        local posts = dbAdmin:exec([[
            SELECT p.ID, p.Title, p.Description, a.Name as "Author"
            FROM Posts p
            LEFT OUTER JOIN Authors a ON p.PID = a.PID;
        ]])
        print("Listing " .. #posts .. " posts")
        Send({ Target = msg.From, Action = "LearnShare.Posts", Data = require('json').encode(posts) })
    end
)

Handlers.add("LearnShare.GetPost",
    function(msg)
        return msg.Action == "GetPost"
    end,
    function(msg)
        local post = dbAdmin:exec(string.format([[
            SELECT p.ID, p.Title, p.Description, a.Name as "Author", p.Body
            FROM Posts p
            LEFT OUTER JOIN Authors a ON p.PID = a.PID
            WHERE p.ID = "%s";
        ]], msg["Post-Id"]))[1]
        Send({ Target = msg.From, Action = "Get-Response", Data = require('json').encode(post) })
        print(post)
    end
)

-- Like Handlers
Handlers.add("LearnShare.LikePost",
    function(msg)
        return msg.Action == "LikePost"
    end,
    function(msg)
        dbAdmin:exec(string.format([[INSERT INTO Likes (post_id, user_id) VALUES ("%s", "%s");]], msg.post_id,
            msg.user_id))
        Send({ Target = msg.From, Action = "Like-Response", Data = "Post liked successfully" })
        print("Post liked successfully")
    end
)

Handlers.add("LearnShare.GetLikes",
    function(msg)
        return msg.Action == "GetLikes"
    end,
    function(msg)
        local likes = dbAdmin:exec(string.format([[SELECT COUNT(*) as count FROM Likes WHERE post_id = "%s";]],
            msg.post_id))[1]
        Send({ Target = msg.From, Action = "Likes-Response", Data = require('json').encode(likes) })
        print("Likes retrieved successfully")
    end
)

-- Chatroom Handlers
Handlers.add("LearnShare.JoinChatroom",
    function(msg)
        return msg.Action == "JoinChatroom"
    end,
    function(msg)
        dbAdmin:exec(string.format([[INSERT OR IGNORE INTO Chatrooms (post_id, user_id) VALUES ("%s", "%s");]],
            msg.post_id, msg.user_id))
        Send({ Target = msg.From, Action = "JoinChatroom-Response", Data = "Joined chatroom successfully" })
        print("Joined chatroom successfully")
    end
)

Handlers.add("LearnShare.GetChatroomMembers",
    function(msg)
        return msg.Action == "GetChatroomMembers"
    end,
    function(msg)
        local members = dbAdmin:exec(string.format([[SELECT user_id FROM Chatrooms WHERE post_id = "%s";]], msg.post_id))
        Send({ Target = msg.From, Action = "ChatroomMembers-Response", Data = require('json').encode(members) })
        print("Chatroom members retrieved successfully")
    end
)

-- Message Handlers
Handlers.add("LearnShare.CreateMessage",
    function(msg)
        return msg.Action == "CreateMessage"
    end,
    function(msg)
        dbAdmin:exec(string.format([[INSERT INTO Messages (post_id, user_id, content) VALUES ("%s", "%s", "%s");]],
            msg.post_id, msg.user_id, msg.content))
        Send({ Target = msg.From, Action = "Message-Response", Data = "Message created successfully" })
        print("Message created successfully")
    end
)

Handlers.add("LearnShare.GetMessages",
    function(msg)
        return msg.Action == "GetMessages"
    end,
    function(msg)
        local messages = dbAdmin:exec(string.format([[SELECT * FROM Messages WHERE post_id = "%s";]], msg.post_id))
        Send({ Target = msg.From, Action = "Messages-Response", Data = require('json').encode(messages) })
        print("Messages retrieved successfully")
    end
)

-- Broadcast to Chatroom Members
Handlers.add("LearnShare.BroadcastMessage",
    function(msg)
        return msg.Action == "BroadcastMessage"
    end,
    function(msg)
        local members = dbAdmin:exec(string.format([[SELECT user_id FROM Chatrooms WHERE post_id = "%s";]], msg.post_id))
        for _, member in ipairs(members) do
            aos.send({ Target = member.user_id, Data = msg.Data })
        end
        Send({ Target = msg.From, Action = "Broadcast-Response", Data = "Broadcasted successfully" })
        print("Broadcasted successfully")
    end
)


-- Delete Post Handler
Handlers.add("LearnShare.DeletePost",
    function(msg)
        return msg.Action == "DeletePost"
    end,
    function(msg)
        -- Check if the post exists
        local post = dbAdmin:exec(string.format([[SELECT ID FROM Posts WHERE ID = "%s";]], msg["Post-Id"]))[1]
        if post then
            -- Delete associated likes, chatrooms, and messages
            dbAdmin:exec(string.format([[DELETE FROM Likes WHERE post_id = "%s";]], msg["Post-Id"]))
            dbAdmin:exec(string.format([[DELETE FROM Chatrooms WHERE post_id = "%s";]], msg["Post-Id"]))
            dbAdmin:exec(string.format([[DELETE FROM Messages WHERE post_id = "%s";]], msg["Post-Id"]))
            -- Delete the post
            dbAdmin:exec(string.format([[DELETE FROM Posts WHERE ID = "%s";]], msg["Post-Id"]))
            Send({ Target = msg.From, Action = "Delete-Response", Data = "Post deleted successfully" })
            print("Post deleted successfully")
        else
            Send({ Target = msg.From, Action = "Delete-Response", Data = "Post not found" })
            print("Post not found")
        end
    end
)



-- Handler to check if a user is registered
Handlers.add("LearnShare.CheckUserR",
    function(msg)
        return msg.Action == "CheckUserR"
    end,
    function(msg)
        -- Query the Authors table for the given PID
        print("Checking user: " .. msg.From)
        local author = dbAdmin:exec(string.format([[SELECT Name FROM Authors WHERE PID = "%s";]], msg.From))[1]

        -- If author is found, return the username
        if author=="J-x6qHeWPYuzbi2pt0HtPw5KxitNwRU2I3hdUWJ9DAo" then
            Send({ Target = msg.From, Action = "CheckUser-Response", Data = author.Name })
            print("User found: " .. author.Name)
            return "User found"
        else
            -- If author is not found, return "User not registered"
            Send({ Target = msg.From, Action = "CheckUser-Response", Data = "User not registered" })
            print("User not registered")
            return "User not registered"
        end
    end
)
