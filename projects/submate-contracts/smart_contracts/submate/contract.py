
from algopy import ARC4Contract, String, UInt64
from algopy.arc4 import abimethod


class Submate(ARC4Contract):

    @abimethod()
    def hello(self, name: String) -> String:
        return "Hello, " + name

    @abimethod()
    def create_group(
        self,
        group_name: String,
        subscription: String,
        per_user_fee: UInt64,
        max_members: UInt64,
        creator: String,
    ) -> None:
        assert group_name != "", "group_name must not be empty"
        assert subscription != "", "subscription must not be empty"
        assert per_user_fee > 0, "per_user_fee must be greater than 0"
        assert max_members > 0, "max_members must be greater than 0"
        assert max_members <= 4, "max_members must be less than or equal to 100"
        
        
        self.group_name = group_name
        self.subscription = subscription
        self.creator = creator
        self.members = creator
        self.pending_members = String("")
        self.per_user_fee = per_user_fee
        self.max_members = max_members
    