def calculate_elo_change(current_elo, question_difficulty, is_correct):
    """
    Calculates the new ELO based on the difficulty of the challenge.
    """
    K = 32  # How much the rank shifts per game
    
    # Probability of winning based on rank difference
    expected_score = 1 / (1 + 10 ** ((question_difficulty - current_elo) / 400))
    actual_score = 1 if is_correct else 0
    
    new_elo = current_elo + K * (actual_score - expected_score)
    return round(new_elo)