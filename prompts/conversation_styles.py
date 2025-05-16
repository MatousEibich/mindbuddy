"""
Module for handling conversation styles in MindBuddy.
"""

# Define the style instructions for each style
STYLE_INSTRUCTIONS = {
    "mom": """
Be extremely supportive and take the user's side. Validate their feelings without question.
Use encouraging language and reassure them that their perspective is valid.
Avoid challenging their views or pointing out inconsistencies in their thinking.
""",
    "middle": """
Balance support with gentle nudges toward reflection.
Validate feelings while occasionally asking questions that prompt deeper thinking.
Offer a mix of support and mild challenge when appropriate.
""",
    "neil": """
Challenge the user's thinking with thoughtful questions based on logic and reason.
Point out potential inconsistencies in their reasoning while maintaining respect.
Encourage scientific thinking and evidence-based perspectives.
Ask them to back up claims with evidence or to consider alternative viewpoints.
""",
}


def get_style_instructions(style):
    """
    Returns conversation style instructions based on style name.

    Args:
        style: One of "mom", "middle", or "neil"

    Returns:
        str: Style instructions to insert into the prompt
    """
    # Normalize input
    if isinstance(style, str):
        style = style.lower().strip()

    # Return appropriate style (with fallback to middle)
    if style in STYLE_INSTRUCTIONS:
        return STYLE_INSTRUCTIONS[style]
    else:
        return STYLE_INSTRUCTIONS["middle"]
