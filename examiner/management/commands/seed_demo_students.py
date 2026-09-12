from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from examiner.models import UserProfile, UserQuestionRecord, Assessment
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = "Seeds demo database with Admin user and 8-10 realistic student profiles, solved questions, and assessments."

    def handle(self, *args, **options):
        # 1. Create or update Admin
        admin_user, _ = User.objects.get_or_create(username='admin', defaults={'is_staff': True, 'is_superuser': True})
        admin_user.set_password('admin123')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        UserProfile.objects.get_or_create(user=admin_user, defaults={'username_alt': 'admin', 'rank': 2200, 'questions_solved': 45})
        self.stdout.write(self.style.SUCCESS("Ensured Admin user (admin / admin123)."))

        # 2. Demo Student Dataset
        demo_students = [
            {
                'username': 'alex_coder',
                'rank': 2190,
                'questions_solved': 38,
                'password': 'pass123',
                'solves': [
                    {'qid': 'two_sum_hash', 'score': 10.0, 'code': 'def twoSum(nums, target):\n    d = {}\n    for i, n in enumerate(nums):\n        if target - n in d: return [d[target-n], i]\n        d[n] = i'},
                    {'qid': 'valid_parentheses_stack', 'score': 10.0, 'code': 'def isValid(s):\n    st = []\n    m = {")":"(", "}":"{", "]":"["}\n    for c in s:\n        if c in m.values(): st.append(c)\n        elif not st or st.pop() != m[c]: return False\n    return not st'}
                ],
                'assessments': [
                    {'title': 'Graph Traversal Benchmark', 'desc': 'Implement BFS and DFS for directed graphs and analyze time complexity.', 'diff': 2000, 'status': 'Completed'}
                ]
            },
            {
                'username': 'sarah_py',
                'rank': 1950,
                'questions_solved': 24,
                'password': 'pass123',
                'solves': [
                    {'qid': 'find_max_numbers', 'score': 10.0, 'code': 'def find_max(numbers):\n    return max(numbers)'},
                    {'qid': 'merge_two_sorted_lists', 'score': 10.0, 'code': 'def merge(l1, l2):\n    return sorted(l1 + l2)'}
                ],
                'assessments': [
                    {'title': 'Dynamic Programming & Memoization', 'desc': 'Solve 0/1 Knapsack using top-down memoization in Python.', 'diff': 1800, 'status': 'Pending'}
                ]
            },
            {
                'username': 'dev_ninja',
                'rank': 1820,
                'questions_solved': 19,
                'password': 'pass123',
                'solves': [
                    {'qid': 'binary_search_rotated', 'score': 10.0, 'code': 'def search(nums, target):\n    l, r = 0, len(nums)-1\n    while l <= r:\n        m = (l+r)//2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1'}
                ],
                'assessments': []
            },
            {
                'username': 'chen_dsa',
                'rank': 1680,
                'questions_solved': 14,
                'password': 'pass123',
                'solves': [
                    {'qid': 'reverse_linked_list', 'score': 10.0, 'code': 'def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev'}
                ],
                'assessments': [
                    {'title': 'Linked List Inversion', 'desc': 'Write an in-place single linked list reversal function.', 'diff': 1600, 'status': 'Completed'}
                ]
            },
            {
                'username': 'algo_master',
                'rank': 2080,
                'questions_solved': 31,
                'password': 'pass123',
                'solves': [
                    {'qid': 'lru_cache_design', 'score': 10.0, 'code': 'class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity'},
                ],
                'assessments': [
                    {'title': 'System Design: O(1) Cache Data Structure', 'desc': 'Implement Doubly Linked List + HashMap for O(1) LRU eviction.', 'diff': 2100, 'status': 'Completed'}
                ]
            },
            {
                'username': 'priya_dev',
                'rank': 1520,
                'questions_solved': 8,
                'password': 'pass123',
                'solves': [
                    {'qid': 'find_max_numbers', 'score': 10.0, 'code': 'def find_max(numbers):\n    res = numbers[0]\n    for x in numbers:\n        if x > res: res = x\n    return res'}
                ],
                'assessments': [
                    {'title': 'Arrays & Two Pointers Baseline', 'desc': 'Solve array partitioning challenges using two pointers technique.', 'diff': 1400, 'status': 'Pending'}
                ]
            },
            {
                'username': 'marcus_v',
                'rank': 1450,
                'questions_solved': 5,
                'password': 'pass123',
                'solves': [],
                'assessments': []
            },
            {
                'username': 'leila_byte',
                'rank': 1740,
                'questions_solved': 12,
                'password': 'pass123',
                'solves': [
                    {'qid': 'climbing_stairs_dp', 'score': 10.0, 'code': 'def climbStairs(n):\n    a, b = 1, 1\n    for _ in range(n-1):\n        a, b = b, a + b\n    return b'}
                ],
                'assessments': [
                    {'title': 'Recursion to Iterative DP', 'desc': 'Convert recursive Fibonacci to bottom-up dynamic programming.', 'diff': 1600, 'status': 'Pending'}
                ]
            }
        ]

        for sdata in demo_students:
            user, u_created = User.objects.get_or_create(username=sdata['username'])
            if u_created:
                user.set_password(sdata['password'])
                user.save()

            profile, p_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'username_alt': sdata['username'],
                    'rank': sdata['rank'],
                    'questions_solved': sdata['questions_solved']
                }
            )
            if not p_created:
                profile.rank = sdata['rank']
                profile.questions_solved = sdata['questions_solved']
                profile.save()

            # Seed Solves
            for solve in sdata.get('solves', []):
                UserQuestionRecord.objects.get_or_create(
                    user_profile=profile,
                    question_id=solve['qid'],
                    defaults={
                        'ai_score': solve['score'],
                        'user_solution': solve['code'],
                        'optimized_code_snippet': 'Optimized complexity: O(N) time, O(1) space.'
                    }
                )

            # Seed Assessments
            for asm in sdata.get('assessments', []):
                Assessment.objects.get_or_create(
                    assigned_by=admin_user,
                    assigned_to=profile,
                    title=asm['title'],
                    defaults={
                        'problem_description': asm['desc'],
                        'difficulty': asm['diff'],
                        'status': asm['status'],
                        'completed_at': timezone.now() if asm['status'] == 'Completed' else None,
                        'user_solution': 'def solution(): pass' if asm['status'] == 'Completed' else ''
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(demo_students)} demo student profiles with assessments and solve records."))
