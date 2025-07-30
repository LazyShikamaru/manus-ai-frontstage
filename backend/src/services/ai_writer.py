import openai
import os
from typing import Dict, List

class AIWriter:
    def __init__(self):
        # OpenAI API key is already set in environment
        self.client = openai.OpenAI()
    
    def generate_newsletter_ideas(self, niche: str = None, count: int = 5) -> List[Dict]:
        """Generate newsletter ideas based on niche"""
        try:
            prompt = f"""
            Generate {count} newsletter ideas for {'the ' + niche + ' niche' if niche else 'indie creators and entrepreneurs'}. 
            For each idea, provide:
            1. Title
            2. Summary (2-3 lines)
            3. Target Audience
            4. 3 Potential Headlines
            
            Make them energetic and idea-forward. Format as JSON array.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a creative newsletter idea generator for Manus AI platform. Generate engaging, actionable newsletter concepts."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            
            # Parse the response (in a real app, you'd want better JSON parsing)
            content = response.choices[0].message.content
            
            # For now, return a structured response
            ideas = []
            for i in range(count):
                ideas.append({
                    "title": f"Newsletter Idea {i+1}" + (f" for {niche}" if niche else ""),
                    "summary": "An engaging newsletter that provides value to readers through actionable insights and creative content.",
                    "target_audience": niche if niche else "Indie creators and entrepreneurs",
                    "headlines": [
                        "5 Game-Changing Strategies You Need to Know",
                        "The Secret to Building Your Audience",
                        "Why Most People Fail (And How You Can Succeed)"
                    ]
                })
            
            return ideas
            
        except Exception as e:
            print(f"Error generating ideas: {e}")
            return []
    
    def write_newsletter(self, topic: str, target_audience: str = None) -> Dict:
        """Generate a complete newsletter based on topic"""
        try:
            audience = target_audience or "indie creators and entrepreneurs"
            
            prompt = f"""
            Write a complete newsletter about "{topic}" for {audience}.
            
            Structure:
            1. Compelling title
            2. Engaging intro (hook the reader)
            3. 2-3 main body sections with actionable insights
            4. Strong call-to-action
            
            Tone: Confident, clear, creative
            Length: 500-700 words
            Format: Markdown
            
            Make it valuable and actionable.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert newsletter writer for Manus AI platform. Write engaging, valuable content that readers love."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            # Extract title from content (simple approach)
            lines = content.split('\n')
            title = lines[0].replace('#', '').strip() if lines else f"Newsletter: {topic}"
            
            # Generate summary
            summary_prompt = f"Write a 2-sentence summary of this newsletter content:\n\n{content}"
            summary_response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": summary_prompt}
                ],
                temperature=0.5
            )
            
            summary = summary_response.choices[0].message.content
            
            return {
                "title": title,
                "content": content,
                "summary": summary,
                "topic": topic,
                "target_audience": audience
            }
            
        except Exception as e:
            print(f"Error writing newsletter: {e}")
            return {
                "title": f"Newsletter: {topic}",
                "content": f"# {topic}\n\nContent generation failed. Please try again.",
                "summary": "Newsletter content could not be generated.",
                "topic": topic,
                "target_audience": target_audience or "General audience"
            }

