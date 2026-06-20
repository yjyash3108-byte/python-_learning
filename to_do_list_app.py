#task =[task_1,task_2,task_3]
# task_1 = input("Enter task one: ")
# task_2 = input("Enter task two: ")
# task_3 = input("Enter task three: ")
# task =[task_1,task_2,task_3]
# print(task)
bag = []

trolley = []
item_1 = input("Enter item_1: ")
item_2 = input("Enter item_2: ")
trolley.append([item_1, item_2])
bag.extend([item_1, item_2])
print(trolley)
print(bag)


