def calculate_elo_change(current_elo, question_difficulty, is_correct):
    """
    Calculates LeetCode-style ELO contest rating update.
    Default initial rating: 1500
    Problem Tiers: Easy (1200), Medium (1600), Hard (2000)
    """
    K = 32  # Rating scale factor
    
    # Expected score based on rating difference
    expected_score = 1 / (1 + 10 ** ((question_difficulty - current_elo) / 400))
    actual_score = 1.0 if is_correct else 0.0
    
    new_elo = current_elo + K * (actual_score - expected_score)
    return max(round(new_elo), 800)  # Rating floor at 800


def get_rank_badge(rank):
    """
    Returns LeetCode contest rating badge title.
    """
    if rank >= 2150:
        return "Guardian 🛡️"
    elif rank >= 1850:
        return "Knight ⚔️"
    else:
        return "Contestant 🧩"