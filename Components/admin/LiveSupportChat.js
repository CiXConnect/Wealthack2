
import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/entities/User';
import { ChatMessage } from '@/entities/ChatMessage';
import { KnowledgeBaseItem } from '@/entities/KnowledgeBaseItem';
import { InvokeLLM } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LiveSupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null); // Will be null for anonymous users
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadChat = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const convId = `user_${currentUser.id}`;
            setConversationId(convId);
            
            let chatMessages = await ChatMessage.filter({ conversation_id: convId }, 'created_date');
            if (chatMessages.length === 0) {
                 // Add a welcoming message if it's a new chat for a logged-in user
                const welcomeMessage = {
                    id: 'welcome',
                    conversation_id: convId,
                    sender_type: 'bot',
                    message_content: 'Hello! My name is Thabo. How can I help you today?',
                    created_date: new Date().toISOString()
                };
                chatMessages = [welcomeMessage];
            }
            setMessages(chatMessages);

        } catch (error) {
            // Not logged in, prepare for anonymous chat
            setUser(null); // Ensure user is explicitly null
            const convId = `anon_${Date.now()}`; // Temporary conversation ID for anonymous user
            setConversationId(convId);
            // Initialize messages with a welcome message for anonymous users
            setMessages([{
                id: 'welcome-anon',
                conversation_id: convId,
                sender_type: 'bot',
                message_content: 'Hello! My name is Thabo. How can I help you today?',
 